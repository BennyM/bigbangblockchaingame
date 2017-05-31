import { UserService } from './services/user.service';
import { AuthenticationCanActivateService } from './services/authentication.can-activate.service';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UniversalModule } from 'angular2-universal';
import { AppComponent } from './components/app/app.component'
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { HomeComponent } from './components/home/home.component';
import { PlayerListComponent } from "./components/player-list/player-list.component";
import { RegisterComponent } from "./components/register/register.component";
import { FormsModule } from "@angular/forms";

@NgModule({
    bootstrap: [ AppComponent ],
    declarations: [
        AppComponent,
        NavMenuComponent,
        HomeComponent,
        PlayerListComponent,
        RegisterComponent
    ],
    providers: [UserService, AuthenticationCanActivateService],
    imports: [
        UniversalModule, // Must be first import. This automatically imports BrowserModule, HttpModule, and JsonpModule too.
        FormsModule,
        RouterModule.forRoot([
            { path: '', redirectTo: 'home', pathMatch: 'full'},
            { path: 'home', component: HomeComponent, canActivate: [AuthenticationCanActivateService]},
            { path: 'players', component: PlayerListComponent},
            { path: 'register', component: RegisterComponent},
            { path: '**', redirectTo: 'home'}
        ])
    ]
})
export class AppModule {
}
