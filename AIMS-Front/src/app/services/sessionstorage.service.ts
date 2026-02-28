import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionstorageService {

  private contextSubject = new BehaviorSubject<any | null >(null)
  private readySubject = new BehaviorSubject<boolean>(false);
  context$ = this.contextSubject.asObservable();
  ready$ = this.readySubject.asObservable();

  private deriveStaffType(rights: any): string {
    if(!rights) return '1'

    if(rights?.hrDepartment?.user.manage === 1){
      return '0'
    }

    for(const deptKey of Object.keys(rights)){
      if(deptKey === 'hrDepartment') continue;

      const dept = rights[deptKey];
      for(const moduleKey of Object.keys(dept)){
        if(dept[moduleKey]?.view === 1){
          return '0'
        }
      }
    }
    return '1'
  }

  setContext(ctx: any){
    if(ctx?.rights){
      ctx.user = {
        ...ctx.user,
        staffType: this.deriveStaffType(ctx.rights)
      }
    }
    this.contextSubject.next(ctx)
    this.readySubject.next(true);
  }

  clear(){
    this.contextSubject.next(null)
    this.readySubject.next(true);
  }

  get snapShot(){
    return this.contextSubject.value;
  }

  get isReady() {
    return this.readySubject.value;
  }
}
