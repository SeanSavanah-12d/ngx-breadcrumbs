
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Observable } from 'rxjs';

import { BreadcrumbsService } from '../services/breadcrumbs.service';
import { Breadcrumb } from '../models/breadcrumb';

@Component({
  selector: 'lib-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})

export class BreadcrumbsComponent {
  public crumbs$!: Observable<Breadcrumb[]>;

  constructor(public breadcrumbsService: BreadcrumbsService) { }

  ngOnInit(): void {
    this.crumbs$ = this.breadcrumbsService.getCrumbs();
  }
}
