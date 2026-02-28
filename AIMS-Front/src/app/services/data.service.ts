import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class DataService {

  private activeDepartment$ = new BehaviorSubject<string | null>(
    sessionStorage.getItem('activeDepartment')
  );

  listenActiveDepartment(): Observable<string | null> {
    return this.activeDepartment$.asObservable();
  }

  setActiveDepartment(dept: string | null) {
    if (dept) {
      sessionStorage.setItem('activeDepartment', dept);
    } else {
      sessionStorage.removeItem('activeDepartment');
    }
    this.activeDepartment$.next(dept);
  }

  getActiveDepartment(): string | null {
    return this.activeDepartment$.value;
  }
}
