import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { UserService } from "../../services/user.service";

@Component({
    selector: 'fetchdata',
    templateUrl: './fetchdata.component.html',
    providers: [UserService]
})
export class FetchDataComponent {
    public forecasts: WeatherForecast[];

    constructor(http: Http, userService: UserService) {
        http.get('/api/SampleData/WeatherForecasts').subscribe(result => {
            this.forecasts = result.json() as WeatherForecast[];
        });
    }
}

interface WeatherForecast {
    dateFormatted: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}
