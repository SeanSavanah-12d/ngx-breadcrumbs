import { Observable } from 'rxjs';
import * as i0 from '@angular/core';
import { InjectionToken, Injector, Provider } from '@angular/core';
import { ActivatedRoute, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

interface Breadcrumb {
    text: string;
    path: string;
}

type PostProcessFunction = (crumbs: Breadcrumb[]) => Promise<Breadcrumb[]> | Observable<Breadcrumb[]> | Breadcrumb[];
type DistinctKey = keyof Breadcrumb;
interface BreadcrumbsConfig {
    postProcess: PostProcessFunction | null;
    applyDistinctOn: DistinctKey | null;
}
declare const BREADCRUMBS_CONFIG: InjectionToken<BreadcrumbsConfig>;

declare class BreadcrumbsService {
    route: ActivatedRoute;
    private router;
    private config;
    private injector;
    private breadcrumbs;
    private defaultResolver;
    constructor(route: ActivatedRoute, router: Router, config: BreadcrumbsConfig, injector: Injector);
    get crumbs$(): Observable<Breadcrumb[]>;
    getCrumbs(): Observable<Breadcrumb[]>;
    private resolveCrumbs;
    static ɵfac: i0.ɵɵFactoryDeclaration<BreadcrumbsService, [null, null, { optional: true; }, null]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<BreadcrumbsService>;
}

declare class BreadcrumbsComponent {
    breadcrumbsService: BreadcrumbsService;
    crumbs$: Observable<Breadcrumb[]>;
    constructor(breadcrumbsService: BreadcrumbsService);
    ngOnInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BreadcrumbsComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BreadcrumbsComponent, "lib-breadcrumbs", never, {}, {}, never, never, true, never>;
}

declare class BreadcrumbsResolver {
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Breadcrumb[]> | Promise<Breadcrumb[]> | Breadcrumb[];
    getFullPath(route: ActivatedRouteSnapshot): string;
    private fetchFullPath;
    private fetchRelativePath;
}

declare function provideBreadcrumbs(config?: BreadcrumbsConfig): Provider[];

export { BREADCRUMBS_CONFIG, BreadcrumbsComponent, BreadcrumbsResolver, BreadcrumbsService, provideBreadcrumbs };
export type { Breadcrumb, BreadcrumbsConfig, DistinctKey, PostProcessFunction };
