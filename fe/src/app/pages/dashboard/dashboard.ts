import { Component } from '@angular/core';
import { Navbar } from "../../shared/navbar/navbar";
import { EarthquakesList } from "../../shared/earthquakes-list/earthquakes-list";

@Component({
  selector: 'app-dashboard',
  imports: [Navbar, EarthquakesList],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

}
