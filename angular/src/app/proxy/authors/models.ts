import type { EntityDto } from '@abp/ng.core';

export interface AuthorDto extends EntityDto<string> {
  name?: string;
  birthDate?: string;
  shortBio?: string | null;
}

export interface AuthorLookupDto extends EntityDto<string> {
  name?: string;
}

export interface CreateAuthorDto {
  name: string;
  birthDate: string;
  shortBio: string | null;
}

export interface UpdateAuthorDto {
  name: string;
  birthDate: string;
  shortBio?: string | null;
}
