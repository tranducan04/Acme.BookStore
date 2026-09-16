using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Acme.BookStore.Books;
using Acme.BookStore.Carts;
using Acme.BookStore.Notifications;
using Acme.BookStore.Permissions;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;
using Volo.Abp.Identity;
using Volo.Abp.Data;
using Microsoft.Extensions.Logging;

namespace Acme.BookStore.Orders;

[Authorize]
public class OrderAppService : ApplicationService, IOrderAppService
{
    private readonly IRepository<Order, Guid> _orderRepository;
    private readonly IRepository<OrderItem, Guid> _orderItemRepository;
    private readonly IRepository<Cart, Guid> _cartRepository;
    private readonly IRepository<CartItem, Guid> _cartItemRepository;
    private readonly IRepository<Book, Guid> _bookRepository;
    private readonly IRepository<AppNotification, Guid> _notificationRepository;
    private readonly IIdentityUserRepository _identityUserRepository;

    private readonly IDataFilter _dataFilter;

    public OrderAppService(
        IRepository<Order, Guid> orderRepository,
        IRepository<OrderItem, Guid> orderItemRepository,
        IRepository<Cart, Guid> cartRepository,
        IRepository<CartItem, Guid> cartItemRepository,
        IRepository<Book, Guid> bookRepository,
        IRepository<AppNotification, Guid> notificationRepository,
        IIdentityUserRepository identityUserRepository,
        IDataFilter dataFilter)
    {
        _orderRepository = orderRepository;
        _orderItemRepository = orderItemRepository;
        _cartRepository = cartRepository;
        _cartItemRepository = cartItemRepository;
        _bookRepository = bookRepository;
        _notificationRepository = notificationRepository;
        _identityUserRepository = identityUserRepository;
        _dataFilter = dataFilter;
    }

    /// <summary>
    /// 1. ĐẶT HÀNG: Tạo đơn + Bắn thông báo Đặt hàng thành công
    /// </summary>
    public async Task<OrderDto> PostAsync(CreateOrderDto input)
    {
        var userId = CurrentUser.GetId();
        
        var queryable = await _cartRepository.WithDetailsAsync(x => x.Items);
        var cart = queryable.FirstOrDefault(x => x.UserId == userId) ?? queryable.FirstOrDefault();
        if (cart == null || cart.Items == null || !cart.Items.Any())
        {
            throw new UserFriendlyException("Giỏ hàng của bạn đang trống!");
        }

        var cartItems = cart.Items.ToList();
        var bookIds = cartItems.Select(x => x.BookId).Distinct().ToList();
        var books = await _bookRepository.GetListAsync(x => bookIds.Contains(x.Id));

        foreach (var item in cartItems)
        {
            var book = books.FirstOrDefault(b => b.Id == item.BookId);
            if (book == null)
            {
                throw new UserFriendlyException("Có cuốn sách trong giỏ không tồn tại!");
            }
            if (book.StockCount < item.Count)
            {
                throw new UserFriendlyException($"Sách '{book.Name}' không đủ tồn kho (Còn lại: {book.StockCount})!");
            }
            book.StockCount -= item.Count;
            await _bookRepository.UpdateAsync(book);
        }

        var orderNo = "ORD-" + DateTime.Now.ToString("yyyyMMddHHmmss");
        var order = new Order(
            GuidGenerator.Create(),
            userId,
            orderNo,
            input.ReceiverName,
            input.ReceiverPhone,
            input.ShippingAddress,
            input.PaymentMethod
        );

        decimal totalAmount = 0;
        foreach (var item in cartItems)
        {
            var book = books.First(b => b.Id == item.BookId);
            var unitPrice = (decimal)book.Price;
            totalAmount += unitPrice * item.Count;

            var orderItem = new OrderItem(
                GuidGenerator.Create(),
                order.Id,
                item.BookId,
                item.Count,
                unitPrice
            );
            order.Items.Add(orderItem);
        }
        order.TotalAmount = totalAmount;
        
        await _orderRepository.InsertAsync(order, autoSave: true);
        await _cartItemRepository.DeleteManyAsync(cartItems);

        // 🔔 TỰ ĐỘNG BẮN THÔNG BÁO CHO KHÁCH HÀNG
        await _notificationRepository.InsertAsync(new AppNotification(
            GuidGenerator.Create(),
            userId,
            "🎉 Đặt hàng thành công!",
            $"Đơn hàng {orderNo} trị giá {totalAmount:N0} VNĐ đã được tạo thành công.",
            NotificationType.Order,
            $"/orders?search={orderNo}"
        ), autoSave: true);
        // 🔔 2. TỰ ĐỘNG BẮN THÔNG BÁO CHO ADMIN KHI CÓ ĐƠN HÀNG MỚI
        try
        {
            var allUsers = await _identityUserRepository.GetListAsync();
            var adminUsers = allUsers.Where(x => x.UserName != null && x.UserName.ToLower().Contains("admin")).ToList();
            foreach (var admin in adminUsers)
            {
                await _notificationRepository.InsertAsync(new AppNotification(
                    GuidGenerator.Create(),
                    admin.Id,
                    "🛒 Có đơn hàng mới!",
                    $"Đơn {orderNo} ({totalAmount:N0} VNĐ) vừa được đặt bởi {input.ReceiverName}.",
                    NotificationType.Order,
                    $"/admin-orders?search={orderNo}"
                ), autoSave: true);
            }
        }
        catch (Exception ex)
        {
            Logger.LogWarning("Không thể gửi thông báo cho Admin: " + ex.Message);
        }
        return await MapToOrderDtoAsync(order);
    }
    /// <summary>
    /// 2. HỦY ĐƠN HÀNG: Hủy đơn + Hoàn kho + Bắn thông báo
    /// </summary>
    public async Task<OrderDto> CancelMyOrderAsync(Guid id)
    {
        var userId = CurrentUser.GetId();
        var order = await _orderRepository.GetAsync(id);

        if (order.UserId != userId)
        {
            throw new UserFriendlyException("Bạn không thể hủy đơn hàng của người khác!");
        }

        if (order.Status != OrderStatus.Placed && order.Status != OrderStatus.Processing)
        {
            throw new UserFriendlyException("Đơn hàng đang giao hoặc đã hoàn thành, không thể hủy!");
        }

        order.Status = OrderStatus.Cancelled;
        await _orderRepository.UpdateAsync(order);

        // Hoàn kho
        var orderItems = await _orderItemRepository.GetListAsync(x => x.OrderId == order.Id);
        foreach (var item in orderItems)
        {
            var book = await _bookRepository.FindAsync(item.BookId);
            if (book != null)
            {
                book.StockCount += item.Count;
                await _bookRepository.UpdateAsync(book);
            }
        }

        // 🔔 BẮN THÔNG BÁO XÁC NHẬN HỦY ĐƠN
        await _notificationRepository.InsertAsync(new AppNotification(
            GuidGenerator.Create(),
            userId,
            "❌ Đã hủy đơn hàng",
            $"Đơn hàng {order.OrderNo} đã được hủy thành công. Số lượng sách đã được hoàn lại kho.",
            NotificationType.Order,
            $"/orders?search={order.OrderNo}"
        ), autoSave: true);

        return await MapToOrderDtoAsync(order);
    }

    /// <summary>
    /// 3. ADMIN DUYỆT ĐƠN: Cập nhật trạng thái + Tự động cộng/trừ kho sách thông minh + Bắn thông báo
    /// </summary>
    public async Task<OrderDto> PutStatusAsync(Guid id, UpdateOrderStatusDto input)
    {
        var order = await _orderRepository.GetAsync(id);
        
        // 🔒 BẢO MẬT: Nếu đơn đã Hủy hoặc Hoàn thành thì chặn không cho đổi nữa
        if (order.Status == OrderStatus.Cancelled || order.Status == OrderStatus.Completed)
        {
            throw new UserFriendlyException("Đơn hàng đã kết thúc (Đã hủy hoặc Hoàn thành), không thể thay đổi trạng thái nữa!");
        }
        var oldStatus = order.Status;
        order.Status = input.Status;
        
        // 🔄 CỘNG HOÀN LẠI KHO SÁCH NẾU HỦY ĐƠN HÀNG
        if (input.Status == OrderStatus.Cancelled && oldStatus != OrderStatus.Cancelled)
        {
            var orderItems = await _orderItemRepository.GetListAsync(x => x.OrderId == id);
            foreach (var item in orderItems)
            {
                var book = await _bookRepository.GetAsync(item.BookId);
                book.StockCount += item.Count;
                await _bookRepository.UpdateAsync(book);
            }
        }
        await _orderRepository.UpdateAsync(order);
        // 🔔 BẮN THÔNG BÁO ĐẾN KHÁCH HÀNG KHI TRẠNG THÁI VẬN CHUYỂN THAY ĐỔI
        string statusText = input.Status switch
        {
            OrderStatus.Processing => "📦 Đang được đóng gói và chuẩn bị gửi",
            OrderStatus.Shipped => "🚚 Đang trên đường vận chuyển đến bạn",
            OrderStatus.Completed => "🎉 Đã được giao thành công. Cảm ơn bạn!",
            OrderStatus.Cancelled => "❌ Đã được hủy bởi quản trị viên",
            _ => "Đã được cập nhật"
        };
        await _notificationRepository.InsertAsync(new AppNotification(
            GuidGenerator.Create(),
            order.UserId,
            "🚚 Cập nhật trạng thái đơn hàng",
            $"Đơn hàng {order.OrderNo}: {statusText}.",
            NotificationType.Shipping,
            $"/orders?search={order.OrderNo}"
        ), autoSave: true);
        return await MapToOrderDtoAsync(order);
    }
    public async Task<PagedResultDto<OrderDto>> GetMyOrdersAsync(PagedAndSortedResultRequestDto input)
    {
        var userId = CurrentUser.GetId();
        var queryable = await _orderRepository.GetQueryableAsync();

        var query = queryable
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreationTime)
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount);

        var orders = await AsyncExecuter.ToListAsync(query);
        var totalCount = await _orderRepository.CountAsync(x => x.UserId == userId);

        var dtos = new List<OrderDto>();
        foreach (var order in orders)
        {
            dtos.Add(await MapToOrderDtoAsync(order));
        }

        return new PagedResultDto<OrderDto>(totalCount, dtos);
    }

    public async Task<PagedResultDto<OrderDto>> GetListAsync(GetOrderFilterDto input)
    {
        var queryable = await _orderRepository.GetQueryableAsync();

        // 🔍 Lọc theo từ khóa (mã đơn, tên người nhận, SĐT)
        if (!string.IsNullOrWhiteSpace(input.Keyword))
        {
            var keyword = input.Keyword.Trim().ToLower();
            queryable = queryable.Where(x =>
                (x.OrderNo != null && x.OrderNo.ToLower().Contains(keyword)) ||
                (x.ReceiverName != null && x.ReceiverName.ToLower().Contains(keyword)) ||
                (x.ReceiverPhone != null && x.ReceiverPhone.ToLower().Contains(keyword))
            );
        }

        // 📋 Lọc theo trạng thái
        if (input.Status.HasValue)
        {
            queryable = queryable.Where(x => x.Status == input.Status.Value);
        }

        // 💳 Lọc theo phương thức thanh toán
        if (input.PaymentMethod.HasValue)
        {
            queryable = queryable.Where(x => x.PaymentMethod == input.PaymentMethod.Value);
        }

        var totalCount = await AsyncExecuter.CountAsync(queryable);

        var orders = await AsyncExecuter.ToListAsync(
            queryable
                .OrderByDescending(x => x.CreationTime)
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount)
        );

        var dtos = new List<OrderDto>();
        foreach (var order in orders)
        {
            dtos.Add(await MapToOrderDtoAsync(order));
        }

        return new PagedResultDto<OrderDto>(totalCount, dtos);
    }

    private async Task<OrderDto> MapToOrderDtoAsync(Order order)
    {
        var items = await _orderItemRepository.GetListAsync(x => x.OrderId == order.Id);
        var bookIds = items.Select(x => x.BookId).Distinct().ToList();

        List<Book> books;
        using (_dataFilter.Disable<ISoftDelete>())
        {
            books = await _bookRepository.GetListAsync(x => bookIds.Contains(x.Id));
        }

        return new OrderDto
        {
            Id = order.Id,
            UserId = order.UserId,
            OrderNo = order.OrderNo,
            Status = order.Status,
            TotalAmount = order.TotalAmount,
            ReceiverName = order.ReceiverName,
            ReceiverPhone = order.ReceiverPhone,
            ShippingAddress = order.ShippingAddress,
            PaymentMethod = order.PaymentMethod,
            PaymentStatus = order.PaymentStatus,
            CreationTime = order.CreationTime,
            Items = items.Select(i =>
            {
                var book = books.FirstOrDefault(b => b.Id == i.BookId);
                var isDeleted = book != null && (book as Volo.Abp.ISoftDelete)?.IsDeleted == true;
                return new OrderItemDto
                {
                    Id = i.Id,
                    BookId = i.BookId,
                    BookName = book != null 
                        ? (isDeleted ? $"{book.Name} (⚠️ Ngừng kinh doanh)" : book.Name) 
                        : "Sách đã bị xóa khỏi hệ thống",
                    CoverImage = book?.CoverImage,
                    Count = i.Count,
                    UnitPrice = i.UnitPrice
                };
            }).ToList()
        };
    }
}
