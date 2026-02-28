import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class DataFormatService {

  hiddenKeys = ['_id', '__v', 'createdAt', 'updatedAt'];

  headerNameMap: Record<string, string> = {
    assetCode: 'Asset Code',
    serialNo: 'Serial Number',
    subCategoryName: 'Sub Category',
    manufacturer: 'Manufacturer',
    manufacturerPartNumber: 'Manufacturer Part Number',
    categoryName: 'Category Name',
    code: 'Code',
    id: 'Id',
    footPrint: 'Foot Print'

  };

  toDisplayName(key: string): any {
    if (this.headerNameMap[key]) return this.headerNameMap[key];

    return key
      .replace(/[_\-]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, c => c.toUpperCase());
  }

  filterKeys(keys: string[]): string[] {
    return keys.filter(k => !this.hiddenKeys.includes(k));
  }

  resolveValue(asset: any, key: string, dept: string, IT: any, EC: any) {
    const value = asset[key];
    const isIT = dept?.toLowerCase().includes('it department');
    const isEC = dept?.toLowerCase().includes('electronic component');

    // --- IT Mappings ---
    if (isIT) {
      if (key === 'subCategoryName') return IT?.subCategoryMap?.[value] || value;
      if (key === 'categoryName') return IT?.categoryMap?.[value] || value;
      if (key === 'manufacturer') return IT?.manufacturerMap?.[value] || value;
    }

    // --- EC Mappings ---
    if (isEC) {
      if (key === 'categoryName') return EC?.categoryMap?.[value] || value;
      if (key === 'manufacturer') return EC?.manufacturerMap?.[value] || value;
      if (key === 'supplierName') return EC?.supplierMap?.[value] || value;
    }

    // Default: raw value
    return value;
  }

}
