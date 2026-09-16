import type { AuditedEntityDto } from '@abp/ng.core';

export interface CreateUpdatePublisherDto {
  name: string;
  address: string | null;
  phoneNumber: string | null;
}

export interface PublisherDto extends AuditedEntityDto<string> {
  name?: string;
  address?: string | null;
  phoneNumber?: string | null;
}
