import { Component, OnInit, PLATFORM_ID, Inject, ElementRef, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/platform-browser';
import * as _ from 'underscore';
import { ConnectivityService } from 'ng-http-sw-proxy';

import { DeviceService } from './services/device-service';
import { SnackBarService } from './services/snack-bar.service';
import { ServiceWorkerService } from './services/service-worker.service';

@Component({
  moduleId: module.id,
  selector: 'app',
  templateUrl: './app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

    public isDesktop: boolean = this.deviceService.isDesktop();
    public navIsFixed: boolean = false;
    private platformId: any;
    private document: any;

    constructor(
        @Inject(PLATFORM_ID)  platformId: any,
        private snackBarService: SnackBarService,
        private conn: ConnectivityService,
        private deviceService: DeviceService,
        @Inject(DOCUMENT) document: any,
        private sws: ServiceWorkerService,
        private elRef: ElementRef
    ) {
        this.platformId = platformId; // Intellij type checking workaround.
        this.document = document; // Intellij type checking workaround.
    }

    public ngAfterViewInit(): void {
        // "sticky" header
        if (!isPlatformBrowser(this.platformId) || !this.isDesktop) {
            return;
        }

        Observable.fromEvent(window, 'scroll').subscribe((e: Event) => this.onScroll());
        this.onScroll();
    }

    public ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        this.sws.checkForUpdates();

        let isOnline: boolean;
        this.conn.hasNetworkConnection()
            .filter((status: boolean) => status !== isOnline)
            .debounceTime(1000)
            .subscribe((status: boolean) => {
                isOnline = status;
                if (status === false) {
                    this.snackBarService.showMessage(
                        'You are offline. All changes will be synced when you will go online again.',
                        'Close'
                    );
                } else {
                    this.snackBarService.showMessage('You are online. All data is synced.', 'Ok', 5000);
                }
            });
    }

    private onScroll(): void {
        const rect = this.elRef.nativeElement.querySelector('#content menu').getBoundingClientRect();
        this.navIsFixed = rect.top <  64;
    }
}
