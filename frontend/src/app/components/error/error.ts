import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './error.html',
  styleUrl: './error.css',
})
export class Error {}
