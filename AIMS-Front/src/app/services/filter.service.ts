import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor(private database: DatabaseService) {}

  getFilteredInventory(filter: any) {
    const payload: any = {};

    if (filter.department) payload.department = filter.department;
    if (filter.category) payload.category = filter.category;
    if (filter.subcategory) payload.subcategory = filter.subcategory;
    if (filter.manufacturer) payload.manufacturer = filter.manufacturer;
    if (filter.manufacturerPartNumber) payload.manufacturerPartNumber = filter.manufacturerPartNumber;

    return this.database.fetchFilteredInventory(payload);
  }

}
