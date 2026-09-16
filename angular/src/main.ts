import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAbpThemeShared, withValidationBluePrint } from '@abp/ng.theme.shared';
import { provideThemeLeptonX } from '@abp/ng.theme.lepton-x';
import { provideSideMenuLayout } from '@abp/ng.theme.lepton-x/layouts';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    ...(appConfig.providers || []),
    provideAbpThemeShared(
      withValidationBluePrint({
        wrongPassword: 'Please choose 1q2w3E*',
      })
    ),
    provideThemeLeptonX(),
    provideSideMenuLayout(),
  ],
}).catch((err) => console.error(err));