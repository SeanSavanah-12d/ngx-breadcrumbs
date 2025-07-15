import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Breadcrumb } from '../models/breadcrumb';

export type PostProcessFunction =
  (crumbs: Breadcrumb[]) => Promise<Breadcrumb[]> | Observable<Breadcrumb[]> | Breadcrumb[];

export type DistinctKey = keyof Breadcrumb;

export interface BreadcrumbsConfig {
  postProcess: PostProcessFunction | null;
  applyDistinctOn: DistinctKey | null;
}
  
export const BREADCRUMBS_CONFIG = new InjectionToken<BreadcrumbsConfig>('BREADCRUMBS_CONFIG');
