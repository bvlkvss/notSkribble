import { Component, OnInit } from '@angular/core';
import {MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.scss']
})
export class ResponseComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ResponseComponent>
  ) { 

  }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }
}
