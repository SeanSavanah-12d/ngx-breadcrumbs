import { Provider } from '@angular/core';
import { BreadcrumbsService } from './services/breadcrumbs.service';
import { BREADCRUMBS_CONFIG, BreadcrumbsConfig } from './services/breadcrumbs.config';

export function provideBreadcrumbs(config: BreadcrumbsConfig = {
    postProcess: null,
    applyDistinctOn: null
}): Provider[] {
  return [
    {
      provide: BREADCRUMBS_CONFIG,
      useValue: config
    },
    BreadcrumbsService
  ];
}
