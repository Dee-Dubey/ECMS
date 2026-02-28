import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private http: HttpClient) { }

  dbAddr = `http://${window.location.hostname}:3010`;


  currentInventory = 'component';


  // Post BOM Files
  postBOMFiles(data: any) {
    return this.http.post(`${this.dbAddr}/bomFiles`, data);
  }

  getConsolidatedBOMFile() {
    return this.http.get(`${this.dbAddr}/consolidatedBOM`, { responseType: 'blob' });
  }

  // Post Cost BOM Files
  postCostBOMFiles(data: any) {
    return this.http.post(`${this.dbAddr}/cost-bom-files`, data);
  }

  getConsolidatedCostBOMFile() {
    return this.http.get(`${this.dbAddr}/cost-bom-consolidated`, { responseType: 'blob' });
  }

  // Post: user data function
  postUser(userData: any) {
    // console.log("postUser", userData);
    return this.http.post(`${this.dbAddr}/user`, userData)
  }

  // Post: user data function
  checkLoginIdInDatabse(loginId: string) {
    return this.http.get(`${this.dbAddr}/user/check/l?loginId=${loginId}`)
  }

  // Post: user data function
  checkEmployeeCode(employeeCode: string) {
    return this.http.get(`${this.dbAddr}/user/check/ec?employeeCode=${employeeCode}`)
  }

  // Get : user loginId function
  getUserByLoginId(loginId: string) {
    return this.http.get(`${this.dbAddr}/user/login?loginId=${loginId}`)
  }
  // Get : user loginId function


  // GET: All user data
  getAllUsers(filter: any) {
    return this.http.get(`${this.dbAddr}/user?type=${filter}`)
  }


  // POST: Login function
  login(data: any) {
    return this.http.post(`${this.dbAddr}/user/login`, data);
  }

  authContext() {
    return this.http.get(`${this.dbAddr}/user/auth/context`)
  }


  // POST: verify the token
  postVerifyToken(data: any) {
    return this.http.post(`${this.dbAddr}/verify-token`, { data })
  }

  // Upload Users from CSV File
  uploadUserCSV(formData: any) {
    return this.http.post(`${this.dbAddr}/user/csvUpload`, formData);
  }

  // Delete a User by loginId
  deleteUser(loginId: string) {
    return this.http.delete(`${this.dbAddr}/user?loginId=${loginId}`);
  }

  // Update User Data by ID
  updateUser(data: any, loginId: string) {
    return this.http.put(`${this.dbAddr}/user?loginId=${loginId}`, data);
  }

  // Reset Users Password
  resetUserPassword(data: any, loginId: string) {
    return this.http.put(`${this.dbAddr}/user/password?loginId=${loginId}`, data);
  }

  // Update User Status
  updateUserStatus(data: any, loginId: string) {
    // console.log(data);
    // console.log(loginId);
    return this.http.put(`${this.dbAddr}/user/status?loginId=${loginId}`, data);
  }

  /*************************[MANUFACTURER SERVICE FUNCTION]***************************************/

  // POST: Manufacturer data to the database
  postManufacturer(componentData: any) {
    return this.http.post(`${this.dbAddr}/hardware/manufacturer`, componentData)
  }

  // GET: Fetch all the Manufacturer data
  getAllManufacturer() {
    return this.http.get(`${this.dbAddr}/hardware/manufacturer`)
  }

  // PUT: update the manufacturer name by using the id
  updateManufacturerById(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/hardware/manufacturer?id=${id}`, data)
  }

  // DELETE: delete the manufacturer name
  deleteManufacturerByName(manufacturerName: string) {
    return this.http.delete(`${this.dbAddr}/hardware/manufacturer?name=${manufacturerName}`)
  }

  //CHECK: Check the manufacturer name
  checkManufacturerName(manufacturerName: string) {
    return this.http.get(`${this.dbAddr}/hardware/manufacturer/check/name?name=${manufacturerName}`)
  }

  /*************************[CATEGORY SERVICE FUNCTION]***************************************/
  //POST: post the category data
  postCategory(componentData: any) {
    return this.http.post(`${this.dbAddr}/hardware/category`, componentData)
  }

  //GET: fetch the category data
  getAllCategory() {
    return this.http.get(`${this.dbAddr}/hardware/category`)
  }

  //PUT: Update the category name by id
  updateCategoryById(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/hardware/category?id=${id}`, data)
  }

  // DELETE: Delete the category data
  deleteCategoryByName(categoryName: any) {
    return this.http.delete(`${this.dbAddr}/hardware/category?name=${categoryName}`)
  }

  //CHECK: Check the category name
  checkCategoryName(categoryName: string) {
    return this.http.get(`${this.dbAddr}/hardware/category/check/name?name=${categoryName}`)
  }

  //Check: Check the category abbrevated name
  checkAbbreviatedName(abbreviationName: string) {
    return this.http.get(`${this.dbAddr}/hardware/category/check/abbreviation?abbreviationName=${abbreviationName}`)
  }



  /*************************[SUPPLIER SERVICE FUNCTION]***************************************/
  //POST: post the supplier data
  postSupplier(componentData: any) {
    return this.http.post(`${this.dbAddr}/hardware/supplier`, componentData)
  }

  //GET: fetch the supplier data
  getAllSupplier() {
    return this.http.get(`${this.dbAddr}/hardware/supplier`)
  }

  //PUT: Update the supplier name by id
  updateSupplierById(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/hardware/supplier?id=${id}`, data)
  }

  // DELETE: Delete the supplier data
  deleteSupplierByName(supplierName: any) {
    return this.http.delete(`${this.dbAddr}/hardware/supplier?name=${supplierName}`)
  }

  //CHECK: Check the supplier name
  checkSupplierName(supplierName: string) {
    return this.http.get(`${this.dbAddr}/hardware/supplier/check/name?name=${supplierName}`)
  }

  /*************************[PROJECT SERVICE FUNCTION]***************************************/
  //POST: post the project data
  postProject(componentData: any) {
    return this.http.post(`${this.dbAddr}/hardware/project`, componentData)
  }

  //GET: fetch the project data
  getAllProject() {
    return this.http.get(`${this.dbAddr}/hardware/project`)
  }

  //PUT: Update the project name by id
  updateProjectById(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/hardware/project?id=${id}`, data)
  }

  // DELETE: Delete the project data
  deleteProjectByName(projectName: any) {
    return this.http.delete(`${this.dbAddr}/hardware/project?name=${projectName}`)
  }

  //CHECK: Check the supplier name
  checkProjectName(projectName: string) {
    return this.http.get(`${this.dbAddr}/hardware/project/check/name?name=${projectName}`)
  }

  /*************************[Shelf Location SERVICE FUNCTION]***************************************/

  // POST: Post the shelf location data
  postShelfLocation(shelfLocationData: any) {
    return this.http.post(`${this.dbAddr}/hardware/shelf`, shelfLocationData)
  }

  // GET: Fetch all the shelf data
  getAllShelf() {
    return this.http.get(`${this.dbAddr}/hardware/shelf`)
  }

  //PUT: Update the shelf data by id
  updateShelfById(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/hardware/shelf?id=${id}`, data)
  }

  // DELETE: Delete the shelf by name
  deleteShelfByName(shelfName: any) {
    // console.log(shelfName)
    return this.http.delete(`${this.dbAddr}/hardware/shelf?shelfName=${shelfName}`)
  }

  //CHECK: Check the shelf name
  checkShelfName(shelfName: string) {
    // console.log(shelfName)
    return this.http.get(`${this.dbAddr}/hardware/shelf/check/name?shelfName=${shelfName}`)
  }




  //POST: Post the data to the backend
  postDashComponentData(componentData: any) {
    // console.log("dTABASE componentData" , componentData)
    return this.http.post(`${this.dbAddr}/hardware/dash-component`, componentData)
  }

  //GET: Fetch the dash component
  getDashComponent() {
    // console.log("--------------------")
    return this.http.get(`${this.dbAddr}/hardware/dash-component`);
  }

  //PUT: Update the dashboard component
  updateDashComponentById(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/hardware/dash-component?id=${id}`, data)
  }

  //Function for change the inventoryType
  setChangeInventoryType(data: string) {
    this.currentInventory = data
  }

  getchangeInventoryType() {
    return this.currentInventory
  }

  //GET: Fetch all the batch no data
  getAllBatchNoByFilter(filterObj: any) {
    return this.http.post(`${this.dbAddr}/hardware/batchNo`, filterObj)
  }

  //POST: Add new Project data from dashboard component
  postNewProject(data: any) {
    return this.http.post(`${this.dbAddr}/hardware/new-project`, data)
  }

  // PUT: Update the new project section from dashboard component
  postExistingProject(data: any) {
    return this.http.post(`${this.dbAddr}/hardware/existingProject`, data)
  }

  // GET: fetch all the component data from database by filter in dashboard
  getAllComponentByFilter(filterObj: any, page: number, limit: number) {
    return this.http.post(`${this.dbAddr}/hardware/components?page=${page}&limit=${limit}`, filterObj)
  }


  // getAllComponentByFilter(filterObj: any){
  //   return this.http.post(`${this.dbAddr}/hardware/components`, filterObj)
  // }

  // POST: Add the issue component from dashbpoard component
  postIssuedComponent(data: any) {
    // console.log("postIssuedComponent", data)
    return this.http.post(`${this.dbAddr}/hardware/issuedComponent`, data)
  }

  postConsumedComponent(data: any) {
    // console.log("postIssuedComponent", data)
    return this.http.post(`${this.dbAddr}/hardware/consumedComponent`, data)
  }


  postReturnComponent(data: any) {
    return this.http.post(`${this.dbAddr}/hardware/returnComponent`, data)
  }

  // POST: Add the change notification quantity
  postNotificationQuantity(data: any) {
    return this.http.post(`${this.dbAddr}/hardware/notificationQuantity`, data);
  }



  // GET: Check the component id from dashboard
  checkComponentId(componentId: string) {
    return this.http.get(`${this.dbAddr}/hardware/checkComponentId?id=${componentId}`)
  }

  checkManufacturerPartNo(data: any) {
    return this.http.get(`${this.dbAddr}/hardware/checkManufacturerPartNo?manufacturerPartNo=${data}`)
  }



  //GET: Fetch all Stock History by issuedTo filter from dashboard component
  // getStockHistoryByIssuedTo(user:string){
  //   return this.http.post(`${this.dbAddr}/hardware/stockHistory`, {user: user});
  // }

  getStockHistoryByFilter(filter: any) {
    // console.log(filter)
    return this.http.post(`${this.dbAddr}/hardware/stockHistoryFilter`, filter);
  }



  //UPDATE: create the stock history and update the component
  postMovedStockComponent(data: any) {
    // console.log("----------------- postmovedstockcomponent", data)
    return this.http.post(`${this.dbAddr}/hardware/movedComponent`, data)
  }

  //POST: Change shelf location
  postUpdatedLocationDetail(data: any) {
    return this.http.post(`${this.dbAddr}/hardware/locationDetail`, data)
  }

  //GET: fetch project name convert project name from id
  getProjectNameList() {
    return this.http.get(`${this.dbAddr}/hardware/projectName`)
  }

  //GET: fetch category name convert category name from id
  getCategoryNameList() {
    return this.http.get(`${this.dbAddr}/hardware/categoryName`)
  }

  //GET: fetch supplier name convert supplier name from id
  getSupplierNameList() {
    return this.http.get(`${this.dbAddr}/hardware/supplierName`)
  }


  //GET: fetch manufacturer name convert manufacturer name from id
  getManufacturerNameList() {
    return this.http.get(`${this.dbAddr}/hardware/manufacturerName`)
  }

  //GET: fetch manufacturer name convert manufacturer name from id
  getShelfLocationList() {
    return this.http.get(`${this.dbAddr}/hardware/shelfLocationName`)
  }


  // GET: Fetch stock history by component id
  getStockHistoryByComponentId(filter: any) {
    return this.http.get(`${this.dbAddr}/hardware/stockhisotry?filter=${filter}`)
  }

  // Get: Fetch stock History by the issued user
  getStockHistoryFromIssuedUser(user: any) {
    return this.http.get(`${this.dbAddr}/hardware/stockHistory?issuedUser=${user}`)
  }


  // POST: Import the component data
  uploadComponentCSV(data: any) {
    return this.http.post(`${this.dbAddr}/hardware/upload`, data);
  }

  checkUploadComponentCSV(data: any) {
    return this.http.post(`${this.dbAddr}/hardware/checkUpload`, data)
  }


  // POST: Export the component wise project data
  exportProjectData(data: any) {
    return this.http.post(`${this.dbAddr}/hardware/export`, data, { responseType: 'blob' });
  }


  // SEARCH:
  filterSearchedComponent(data: any, page: number, limit: number) {
    // console.log(data)
    return this.http.post(`${this.dbAddr}/hardware/searchedComponent?page=${page}&limit=${limit}`, data)
  }

  //Stock History filter
  filterStockHistoryByTransactionType(data: any) {
    return this.http.post(`${this.dbAddr}/hardware/filterHistoryByTransactionType`, data)
  }











  /*******************IT Inventory***********************/

  // GET: Get IT Subcategory Name list
  getITSubCategoryNameList() {
    return this.http.get(`${this.dbAddr}/itinventory/ITSubCategoryName`)
  }

  // GET: Get IT Category Name list
  getITCategoryNameList() {
    return this.http.get(`${this.dbAddr}/itinventory/ITCategoryName`)
  }

  // GET: Get IT Subcategory Name list
  getITManufacturerNameList() {
    return this.http.get(`${this.dbAddr}/itinventory/ITManufacturerName`)
  }

  // GET: Get IT Subcategory Name list
  getITSupplierNameList() {
    return this.http.get(`${this.dbAddr}/itinventory/ITSupplierName`)
  }

  // POST: Post subcategory data and field
  postSubCategory(data: any) {
    // console.log("post ITsubcategories:", data);
    return this.http.post(`${this.dbAddr}/itinventory/subcategory`, data)
  }

  // EDIT: Edit subcategory data
  editSubcategory(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/itinventory/subcategory?subcategoryId=${id}`, data)
  }

  //CHECK: Abbreviated Name for Sub Category
  checkITPrefixSuffix(abbreviationName: any) {
    return this.http.get(`${this.dbAddr}/itinventory/subcategory/check/abbreviation?abbreviationName=${abbreviationName}`)
  }


  // Delete: Delete subcategory data
  deleteSubCategory(id: string) {
    return this.http.delete(`${this.dbAddr}/itinventory/subcategory?subcategoryId=${id}`)
  }

  // POST: Post inventory supplier data
  postInventorySupplier(data: any) {
    return this.http.post(`${this.dbAddr}/itinventory/invenSupplier`, data)
  }

  // EDIT: Edit inventory supplier data
  editInventorySupplier(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/itinventory/invenSupplier?supplierId=${id}`, data)
  }

  // DELETE: Delete inventory supplier data
  deleteInvemtorySupplier(supplierId: any) {
    return this.http.delete(`${this.dbAddr}/itinventory/invenSupplier?supplierId=${supplierId}`)
  }

  // EDIT: Edit inventory manufacturer data
  editInventoryManufacturer(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/itinventory/invenManufacturer?manufacturerId=${id}`, data)
  }

  // DELETE: Delete inventory manufacturer data
  deleteInvemtoryManufacturer(manufacturerId: any) {
    return this.http.delete(`${this.dbAddr}/itinventory/invenManufacturer?manufacturerId=${manufacturerId}`)
  }

  // POST: Post inventory manufacturer data
  postInventoryManufacturer(data: any) {
    return this.http.post(`${this.dbAddr}/itinventory/invenManufacturer`, data)
  }

  // GET: Get inventory supplier data
  getInventorySupplier() {
    return this.http.get(`${this.dbAddr}/itinventory/invenSupplier`)
  }

  // GET: Get inventory Manufacturer data
  getInventoryManufacturer() {
    return this.http.get(`${this.dbAddr}/itinventory/invenManufacturer`)
  }

  // GET: Get inventory sub category data
  getInventorySubCategory() {
    // console.log("get inventory sub category: ", this.getInventorySubCategory)
    return this.http.get(`${this.dbAddr}/itinventory/subcategory`)
  }

  // Get: Check subcategory name
  checkSubCategoryName(subCategoryName: string) {
    return this.http.get(`${this.dbAddr}/itinventory/checkSubCategoryName?subCategoryName=${subCategoryName}`)
  }

  // Get: Check edit Subcategory name
  checkEditSubCategoryName(subCategoryName: string) {
    return this.http.get(`${this.dbAddr}/itinventory/checkEditSubCategoryName?subCategoryName=${subCategoryName}`)
  }

  // check manufacturer in data in component
  checkManufacturerInDatabase(manufacturerName: string) {
    return this.http.get(`${this.dbAddr}/hardware/checkManufacturer?manufacturerName=${manufacturerName}`)
  }

  //Check Edit Manufacturer in component
  checkEditManufacturerInDatabase(editManufacturerName: string) {
    return this.http.get(`${this.dbAddr}/hardware/checkEditManufacturer?manufacturerName=${editManufacturerName}`)
  }


  // check Supplier in data in component
  checkSupplierInDatabase(supplierName: string) {
    return this.http.get(`${this.dbAddr}/hardware/checkSupplier?supplierName=${supplierName}`)
  }

  // check edit supplier in Component
  checkEditSupplierInDatabase(editSupplierName: string) {
    return this.http.get(`${this.dbAddr}/hardware/checkEditSupplier?supplierName=${editSupplierName}`)
  }

  //POST: Post the IT-Inventory data to the backend
  postDashInventory(inventoryData: any, quantity: number) {
    return this.http.post(`${this.dbAddr}/itinventory/dash-inventory?quantity=${quantity}`, inventoryData)
  }

  // GET: fetch all the component data from database by filter in dashboard for IT-Inventory
  getAllInventorytByFilter(filter: any, page: number, limit: number) {
    return this.http.post(`${this.dbAddr}/itinventory/inventories?page=${page}&limit=${limit}`, filter)
  }

  //Check category name in IT-Inventory
  checkItCategoryName(category: String) {
    return this.http.get(`${this.dbAddr}/itinventory/checkItCategoryName?name=${category}`)
  }

  //POST CATEGORY DATA
  postITCategory(data: any) {
    return this.http.post(`${this.dbAddr}/itinventory/invenCategory`, data)
  }

  //GET: fetch the category data
  getAllInvenCategory() {
    return this.http.get(`${this.dbAddr}/itinventory/invenCategory`)
  }

  //Check EditCategory Name in IT
  checkEditITCategoryName(editCategoryName: any) {
    return this.http.get(`${this.dbAddr}/itinventory/checkEditItCategoryName?name=${editCategoryName}`)
  }

  //PUT: Update the category name by id
  updateITCategoryById(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/itinventory/invenCategory?id=${id}`, data)
  }


  //GET IT STOCKHISTORY BY INVENTORYID
  getITStockHistoryByInventoryId(inventoryId: string) {
    return this.http.get(`${this.dbAddr}/itinventory/invenStockHistory?filter=${inventoryId}`)
  }

  //PUT: Update the dashboard component
  updateInvenDashById(updatedInventory: any, inventoryId: string) {
    return this.http.put(`${this.dbAddr}/itinventory/dash-inventory?id=${inventoryId}`, updatedInventory)
  }

  //Post Issue data in IT-Inventory
  postIssuedITInventory(issuedData: any) {
    // console.log("post issued inventory", issuedData);
    return this.http.post(`${this.dbAddr}/itinventory/issuedInventory`, issuedData)

  }

  //Post Return data in It-Inventory
  postReturnInventory(returnedData: any) {
    // console.log("post returned inventory", returnedData);
    return this.http.post(`${this.dbAddr}/itinventory/returnedInventory`, returnedData)

  }

  //Get issued data in IT-INventory
  getIssuedData(inventoryId: string) {
    // console.log("inventory issued data", inventoryId)
    return this.http.get(`${this.dbAddr}/itinventory/issuedData/?id=${inventoryId}`)
  }

  //For Update IT-Inventory Status
  updateinventoryStatus(inventoryId: string, status: string) {
    const body = { inventoryId, status }
    return this.http.post(`${this.dbAddr}/itinventory/updateStatus`, body)
  }

  //For Upload csv in IT-Inventory
  uploadInventoryCSV(data: any) {
    // console.log("upload it data", data)
    return this.http.post(`${this.dbAddr}/itinventory/uploadInventory`, data);
  }

  //For search in IT-Inventory
  filterSearchedInventory(data: any, page: number, limit: number) {
    // console.log("filter search inventory", data);
    return this.http.post(`${this.dbAddr}/itinventory/searchInventory?page=${page}&limit=${limit}`, data);
  }


  // Get query to fetch the data which is issued to the user
  getITAssignedUserData(user: any) {
    return this.http.get(`${this.dbAddr}/itinventory/ITAssignedUserData?issuedUser=${user}`)
  }

  // Get History data for particular user / Employee in IT-Inventory
  getITStockHistoryData(user: any) {
    return this.http.get(`${this.dbAddr}/itinventory/stockHistoryByUser?issuedUser=${user}`)
  }

  //Get summary for IT-Inventory
  getITStockSummary() {
    return this.http.get(`${this.dbAddr}/itinventory/summary`)
  }

  exportITAssetData(data: any) {
    return this.http.post(`${this.dbAddr}/itinventory/export/asset`, data)
  }

  getAppVersion() {
    return this.http.get(`${this.dbAddr}/app-version`);
  }

  createAMC(payload: any) {
    return this.http.post(`${this.dbAddr}/api/amc`, payload)
  }

  getAllAMCs(page: number, limit: number, status: string): any {
    return this.http.get<any>(`${this.dbAddr}/api/amc?page=${page}&limit=${limit}&status=${status}`);
  }

  fetchFilteredInventory(payload: any) {
    return this.http.post(`${this.dbAddr}/api/amc/inventory-filter`, payload)
  }

  getAMCHistory(amcID: string, filter: string) {
    return this.http.get<{ status: number; message: string; count: number; data: any[] }>(`${this.dbAddr}/api/amc/${amcID}/history?filter=${filter}`)
  }

  getAMCById(amcID: string) {
    return this.http.get<{ status: number; message: string; count: number; data: any[] }>(`${this.dbAddr}/api/amc/${amcID}`)
  }

  updateAMC(id: string, payload: any) {
    return this.http.put(`${this.dbAddr}/api/amc/${id}`, payload);
  }

  extendedAMC(payload: any) {
    return this.http.post(`${this.dbAddr}/api/amc/extend`, payload);
  }

  initiateService(payload: any) {
    return this.http.post(`${this.dbAddr}/api/amc/service/initiate`, payload);
  }

  updateServiceByNumber(payload: any) {
    return this.http.put(`${this.dbAddr}/api/amc/service/update`, payload);
  }

  serviceClose(payload: any) {
    return this.http.post(`${this.dbAddr}/api/amc/service/close`, payload);
  }

  initiateRepair(payload: any) {
    return this.http.post(`${this.dbAddr}/api/amc/repair/initiate`, payload);
  }

  repairClose(payload: any) {
    return this.http.post(`${this.dbAddr}/api/amc/repair/close`, payload);
  }

  getAMCAvailableAssets(id: string) {
    return this.http.get<{ status: number; message: string; count: number; data: any }>(`${this.dbAddr}/api/amc/${id}/available-assets`)
  }


  getOpenOnlyServiceByID(amcId: string) {
    return this.http.post<{ status: number; serviceInitiated: any[]; repairInitiated: any[] }>(
      `${this.dbAddr}/api/amc/open-service-by-id`,
      { id: amcId }
    );
  }

  // database.service.ts
  getServiceDetailsByNumber(payload: { serviceNumber: string }) {
    return this.http.post<{
      status: number;
      data: any
    }>(
      `${this.dbAddr}/api/amc/service-data-by-number`,
      payload
    );
  }


  getOpenOnlyServices(payload: any) {
    return this.http.post<any>(
      `${this.dbAddr}/api/amc/open-services`,
      payload
    );
  }

  createServiceProvider(payload: any) {
    return this.http.post<any>(`${this.dbAddr}/api/amc/service-provider`, payload)
  }

  updateServiceProvider(id: string, payload: any) {
    return this.http.put(
      `${this.dbAddr}/api/amc/${id}/service-provider`,
      payload
    );
  }

  getServiceProvider() {
    return this.http.get<{ status: number, data: any }>(`${this.dbAddr}/api/amc/service-provider`)
  }




  /**
   * ==========================================================================================================================
   * Department: Admin Department
   * Sub-Section: Consumable Section
   *
   *
  */
  /**
   * ===================================================================
   * Category Section:
   * GET, POST, PUT
   *
   */
  // GET: Get a consumable category name list
  fetchConsumableCategory() {
    return this.http.get(`${this.dbAddr}/consumable/categoryName`)
  }

  // POST: Creates a new consumable category
  createConsumableCategory(data: any) {
    return this.http.post(`${this.dbAddr}/consumable/category`, data)
  }

  //PUT: Updates a consumable category by ID
  updateConsumableCategoryById(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/consumable/category/${id}`, data);
  }

  /**
   * ===================================================================
   * Supplier Section:
   * GET, POST, PUT
   *
   */
  // GET: Get consumable supplier name list
  fetchConsumableSupplier() {
    return this.http.get(`${this.dbAddr}/consumable/supplierName`)
  }

  // POST: Creates a new consumable supplier
  createConsumableSupplier(data: any) {
    return this.http.post(`${this.dbAddr}/consumable/supplier`, data)
  }

  //PUT: Updates a consumable supplier by ID
  updateConsumableSupplierById(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/consumable/supplier/${id}`, data);
  }


  /**
   * ===================================================================
   * Location Section:
   * GET, POST, PUT
   *
   */
  // GET: Get consumable location name list
  fetchConsumableLocation() {
    return this.http.get(`${this.dbAddr}/consumable/locationName`)
  }

  // POST: Creates a new consumable location
  createConsumableLocation(data: any) {
    return this.http.post(`${this.dbAddr}/consumable/location`, data)
  }

  //PUT: Updates a consumable location by ID
  updateConsumableLocationById(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/consumable/location/${id}`, data);
  }

  /**
   * ===================================================================
   * Item Name Section:
   * GET, POST, PUT, GET BY ID
   *
   */
  //POST: Creates a new consumable item name
  createItem(data: any) {
    return this.http.post(`${this.dbAddr}/consumable/create-item`, data);
  }

  // GET: Get consumable item name list
  fetchItem() {
    return this.http.get(`${this.dbAddr}/consumable/fetch-item`);
  }

  // PUT: Updates a consumable item name by ID
  updateItemById(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/consumable/update-item?id=${id}`, data);
  }

  // GET BY ID: Get consumable item name list by ID
  fetchItemById(id: string) {
    return this.http.get(`${this.dbAddr}/consumable/fetch-item?id=${id}`);
  }

  // POST: check item name exists (need to modify as per data)
  checkItemNameExists(data: any) {
    return this.http.post(`${this.dbAddr}/consumable/consumableCheckItemName`, data);
  }

  

  /**
   * ===================================================================
   * Challan Number Section:
   * GET, POST, PUT, GET BY ID
   *
   */
  //POST: Creates a new consumable challan number with data
  createChallan(data: any) {
    return this.http.post(`${this.dbAddr}/consumable/challan-entry`, data);
  }

  // GET: Get consumable challan list
  fetchChallan() {
    return this.http.get(`${this.dbAddr}/consumable/challan`);
  }

  // PUT: Updates a consumable Challan by ID
  updateChallanById(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/consumable/challan?id=${id}`, data);
  }

  // GET BY ID:
  fetchChallanById(id: string) {
    return this.http.get(`${this.dbAddr}/consumable/challan?id=${id}`);
  }

  /**
   * ===================================================================
   * Bill Number Section:
   * GET, POST, PUT, GET BY ID
   *
   */
  //POST: Creates a new consumable bill number with data
  createBill(data: any) {
    console.log('--------*****--------------', data);
    return this.http.post(`${this.dbAddr}/consumable/bill-entry`, data);
  }

  // GET: Get consumable bill list
  fetchBill() {
    return this.http.get(`${this.dbAddr}/consumable/bill`);
  }

  // PUT: Updates a consumable bill by ID
  updateBillById(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/consumable/bill?id=${id}`, data);
  }

  // GET BY ID:
  fetchBillById(id: string) {
    return this.http.get(`${this.dbAddr}/consumable/bill?id=${id}`);
  }










  /** ----------- Add new item name  -----------*/
  // POST: consumable add item
  postConsumableAddItemName(data: any) {
    return this.http.post(`${this.dbAddr}/consumable/consumableAddItemName`, data);
  }

  // GET: fetch all the consumable data
  getConsumableData() {
    return this.http.get(`${this.dbAddr}/consumable/consumableData`);
  }

  // GET: fetch all the component data from database by filter in dashboard for Consumable
  getAllConsumableByFilter(filter: any, page: number, limit: number) {
    return this.http.post(`${this.dbAddr}/consumable/consumable?page=${page}&limit=${limit}`, filter);
  }

  //POST: For search in Consumable
  filterSearchedConsumable(data: any, page: number, limit: number) {
    return this.http.post(`${this.dbAddr}/consumable/searchConsumable?page=${page}&limit=${limit}`, data);
  }

  //GET IT STOCKHISTORY BY CONSUMABLE ID
  getStockHistoryByConsumableId(consumableId: string) {
    return this.http.get(`${this.dbAddr}/consumable/consumableStockHistory?filter=${consumableId}`);
  }

  //POST: Post the IT-Inventory data to the backend
  postConsumableData(consumable: any) {
    return this.http.post(`${this.dbAddr}/consumable/consumable-create`, consumable);
  }

  //PUT: Update consumable modify data
  updateConsumableModifyById(updatedConsumable: any, consumableId: string) {
    return this.http.put(`${this.dbAddr}/consumable/consumable-update-modify?id=${consumableId}`, updatedConsumable);
  }

  //PUT: Update the Add Assets
  updateConsumableAddAssetsById(addConsumeAssets: any, consumableId: string) {
    return this.http.put(`${this.dbAddr}/consumable/consumable-update-addAssets?id=${consumableId}`, addConsumeAssets);
  }

  //PUT: Update the consume Assets
  updateConsumableConsumeAssetsById(updateConsumeAssets: any, consumableId: string) {
    return this.http.put(`${this.dbAddr}/consumable/consumable-update-consumeAssets?id=${consumableId}`, updateConsumeAssets);
  }

  //GET: Consumable history by ID
  getConsumableHistoryById(consumableId: string) {
    return this.http.get(`${this.dbAddr}/consumable/consumableHistory?filter=${consumableId}`);
  }

  // POST: consumable assets date
  exportConsumableAssetData(data: any) {
    return this.http.post(`${this.dbAddr}/consumable/export/asset`, data)
  }









  /**
   * ===================================================================
   * Company Section:
   * GET, POST, PUT
   *
  */
  // GET: Get company name list
  getCompanyNameList() {
    return this.http.get(`${this.dbAddr}/api/company/`)
  }

  // POST: Create a new company
  postCompany(data: any) {
    return this.http.post(`${this.dbAddr}/api/company`, data)
  }

  //PUT: Update the company name by id
  updateCompanyById(data: any, id: string) {
    return this.http.put(`${this.dbAddr}/api/company/${id}`, data);
  }

}
