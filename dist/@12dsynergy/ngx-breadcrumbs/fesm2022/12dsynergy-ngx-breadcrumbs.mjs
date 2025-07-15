import * as i0 from '@angular/core';
import { InjectionToken, Optional, Inject, Injectable, Component } from '@angular/core';
import * as i2 from '@angular/common';
import { CommonModule } from '@angular/common';
import * as i1 from '@angular/router';
import { NavigationEnd, RouterModule } from '@angular/router';
import { Observable, from, of, BehaviorSubject, concat } from 'rxjs';
import { filter, flatMap, distinct, tap, toArray, first } from 'rxjs/operators';

const BREADCRUMBS_CONFIG = new InjectionToken('BREADCRUMBS_CONFIG');

class BreadcrumbsUtils {
    static stringFormat(rawTemplate, data) {
        const templateRegex = new RegExp('{{[\\s]*[a-zA-Z._]+?[\\s]*}}', 'g');
        return rawTemplate.replace(templateRegex, (match) => {
            const keyRegex = new RegExp('([a-zA-Z._]+)', 'g');
            const key = match.match(keyRegex);
            if (!key || !key.length) {
                return match;
            }
            const value = BreadcrumbsUtils.leaf(data, key[0]);
            if (!value) {
                return key[0];
            }
            return value;
        });
    }
    static wrapIntoObservable(value) {
        if (value instanceof Observable) {
            return value;
        }
        if (this.isPromise(value)) {
            return from(Promise.resolve(value));
        }
        return of(value);
    }
    static isPromise(value) {
        return value && (typeof value.then === 'function');
    }
    /**
     * Access object nested value by giving a path
     *
     * @param obj The object you want to access value from
     * @param path The value path. e.g: `bar.baz`
     * @example
     *   const obj = { foo: { bar: 'Baz' } };
     *   const path = 'foo.bar';
     *   leaf(obj, path) // 'Baz'
     */
    static leaf(obj, path) {
        const result = path.split('.').reduce((value, el) => value[el] || {}, obj);
        return BreadcrumbsUtils.isEmptyObject(result) ? null : result;
    }
    /**
     * checks whether an object is empty or not
     *
     * @param obj object to extract values from
     * @returns boolean
     */
    static isEmptyObject(obj) {
        if (typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]') {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
}

class BreadcrumbsResolver {
    resolve(route, state) {
        const data = route.routeConfig.data;
        const path = this.getFullPath(route);
        let text = typeof (data.breadcrumbs) === 'string' ? data.breadcrumbs : data.breadcrumbs.text || data.text || path;
        text = BreadcrumbsUtils.stringFormat(text, route.data);
        const crumbs = [{
                text,
                path
            }];
        return of(crumbs);
    }
    getFullPath(route) {
        return this.fetchFullPath(route.pathFromRoot);
    }
    fetchFullPath(routes) {
        return routes.reduce((path, route) => path += this.fetchRelativePath(route.url), '');
    }
    fetchRelativePath(urlSegments) {
        return urlSegments.reduce((path, urlSegment) => path += '/' + urlSegment.path, '');
    }
}

class BreadcrumbsService {
    route;
    router;
    config;
    injector;
    breadcrumbs = new BehaviorSubject([]);
    defaultResolver = new BreadcrumbsResolver();
    constructor(route, router, config, injector) {
        this.route = route;
        this.router = router;
        this.config = config;
        this.injector = injector;
        this.router.events.pipe(filter((x) => x instanceof NavigationEnd || x['routerEvent'] instanceof NavigationEnd)).subscribe(() => {
            const routeRoot = router.routerState.snapshot.root;
            this.resolveCrumbs(routeRoot).pipe(flatMap((crumbs) => crumbs), this.config.applyDistinctOn
                ? distinct((crumb) => crumb[this.config.applyDistinctOn])
                : tap(), toArray(), flatMap((crumbs) => {
                if (this.config.postProcess) {
                    const postProcessedCrumb = this.config.postProcess(crumbs);
                    return BreadcrumbsUtils.wrapIntoObservable(postProcessedCrumb).pipe(first());
                }
                else {
                    return of(crumbs);
                }
            })).subscribe((crumbs) => {
                this.breadcrumbs.next(crumbs);
            });
        });
    }
    get crumbs$() {
        return this.breadcrumbs;
    }
    getCrumbs() {
        return this.crumbs$;
    }
    resolveCrumbs(route) {
        let crumbs$;
        const data = route.routeConfig && route.routeConfig.data;
        if (data && data.breadcrumbs) {
            let resolver;
            if (data.breadcrumbs.prototype instanceof BreadcrumbsResolver) {
                resolver = this.injector.get(data.breadcrumbs);
            }
            else {
                resolver = this.defaultResolver;
            }
            const result = resolver.resolve(route, this.router.routerState.snapshot);
            crumbs$ = BreadcrumbsUtils.wrapIntoObservable(result).pipe(first());
        }
        else {
            crumbs$ = of([]);
        }
        if (route.firstChild) {
            crumbs$ = concat(crumbs$, this.resolveCrumbs(route.firstChild));
        }
        return crumbs$;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.1.0", ngImport: i0, type: BreadcrumbsService, deps: [{ token: i1.ActivatedRoute }, { token: i1.Router }, { token: BREADCRUMBS_CONFIG, optional: true }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.1.0", ngImport: i0, type: BreadcrumbsService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.1.0", ngImport: i0, type: BreadcrumbsService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.ActivatedRoute }, { type: i1.Router }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BREADCRUMBS_CONFIG]
                }] }, { type: i0.Injector }] });

class BreadcrumbsComponent {
    breadcrumbsService;
    crumbs$;
    constructor(breadcrumbsService) {
        this.breadcrumbsService = breadcrumbsService;
    }
    ngOnInit() {
        this.crumbs$ = this.breadcrumbsService.getCrumbs();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.1.0", ngImport: i0, type: BreadcrumbsComponent, deps: [{ token: BreadcrumbsService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.1.0", type: BreadcrumbsComponent, isStandalone: true, selector: "lib-breadcrumbs", ngImport: i0, template: "<ol *ngIf=\"crumbs$ | async as crumbs\" class=\"breadcrumbs__container\">\r\n    <li *ngFor=\"let crumb of crumbs; let last = last\"\r\n        [ngClass]=\"{ 'breadcrumbs__item--active': last }\"\r\n        class=\"breadcrumbs__item\">\r\n        <a *ngIf=\"!last\" [routerLink]=\"crumb.path\">{{ crumb.text }}</a>\r\n        <span *ngIf=\"last\">{{ crumb.text }}</span>\r\n    </li>\r\n</ol>", styles: [""], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i2.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "ngmodule", type: RouterModule }, { kind: "directive", type: i1.RouterLink, selector: "[routerLink]", inputs: ["target", "queryParams", "fragment", "queryParamsHandling", "state", "info", "relativeTo", "preserveFragment", "skipLocationChange", "replaceUrl", "routerLink"] }, { kind: "pipe", type: i2.AsyncPipe, name: "async" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.1.0", ngImport: i0, type: BreadcrumbsComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-breadcrumbs', standalone: true, imports: [CommonModule, RouterModule], template: "<ol *ngIf=\"crumbs$ | async as crumbs\" class=\"breadcrumbs__container\">\r\n    <li *ngFor=\"let crumb of crumbs; let last = last\"\r\n        [ngClass]=\"{ 'breadcrumbs__item--active': last }\"\r\n        class=\"breadcrumbs__item\">\r\n        <a *ngIf=\"!last\" [routerLink]=\"crumb.path\">{{ crumb.text }}</a>\r\n        <span *ngIf=\"last\">{{ crumb.text }}</span>\r\n    </li>\r\n</ol>" }]
        }], ctorParameters: () => [{ type: BreadcrumbsService }] });

function provideBreadcrumbs(config = {
    postProcess: null,
    applyDistinctOn: null
}) {
    return [
        {
            provide: BREADCRUMBS_CONFIG,
            useValue: config
        },
        BreadcrumbsService
    ];
}

/**
 * Generated bundle index. Do not edit.
 */

export { BREADCRUMBS_CONFIG, BreadcrumbsComponent, BreadcrumbsResolver, BreadcrumbsService, provideBreadcrumbs };
//# sourceMappingURL=12dsynergy-ngx-breadcrumbs.mjs.map
