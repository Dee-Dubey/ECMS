import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-bom-tools',
  templateUrl: './bom-tools.component.html',
  styleUrls: ['./bom-tools.component.css']
})
export class BomToolsComponent implements OnInit {

  // Tool Selector Flag
  toolType: boolean = true;

  bomFiles: Array<any> = [];
  bomFilesList: Array<any> = [];
  numberOfSystems: Number = 1;

  consolidatedBOMFile: any = null;
  costBOMFiles: Array<any> = [];
  costBOMFilesList: Array<any> = [];
  numSystemsCost: number = 1;

  constructor(private database: DatabaseService) { }

  ngOnInit(): void { }

  /** This function Change tool*/
  changeTool(tool: boolean) {
    if (tool != this.toolType) {
      this.toolType = tool;
    }
  }

  /** This function select csv file for component*/
  selectBOMFiles(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files?.length !== undefined && target.files.length > 0) {
      var filesLength = target.files.length;
      for (let i = 0; i < filesLength; i++) {
        var check = this.bomFiles.find(obj => (target.files !== null && obj.name === target.files[i].name));
        if (!check) {
          this.bomFiles.push(target.files[i]);
          this.bomFilesList.push({ name: target.files[i].name, quantity: 1 });
        }
      }
    }
  }

  /** This function remove BOM file for component*/
  removeBOMFile(index: number) {
    this.bomFiles.splice(index, 1);
    this.bomFilesList.splice(index, 1);
  }

  /** This function upload BOM file for component*/
  uploadBOMFiles(): void {
    if (this.bomFiles.length > 0) {
      const formData = new FormData();
      this.bomFiles.forEach((file: any) => {
        formData.append('files', file, file.name);
      });
      formData.append('fileList', JSON.stringify(this.bomFilesList))
      formData.append('numSystems', JSON.stringify(this.numberOfSystems))

      // Replace the URL with your backend API endpoint
      this.database.postBOMFiles(formData)
        .subscribe((response: any) => {
          if (response.status === 1) {
            console.log(response.message);
            this.database.getConsolidatedBOMFile().subscribe((response: Blob) => {
              // Create a URL for the Blob
              const url = window.URL.createObjectURL(response);
              // Create a link element and set its href attribute to the Blob URL
              const a = document.createElement('a');
              a.href = url;
              a.download = 'Consolidated BOM.xlsx'; // Set the desired file name
              document.body.appendChild(a);
              a.click();
              // Clean up
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            }, error => {
              console.error('File download error:', error);
              alert('File download error:');
            });
          } else {
            alert("Issue processing files, please try again");
          }
        }, (error: any) => {
          console.error('Error uploading files', error);
          alert('Error uploading files');
        });
    } else {
      alert('No files selected');
    }
  }

  /** This function select consolidated BOM file*/
  selectConsolidatedBOMFile(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files?.length !== undefined && target.files.length > 0) {
      var filesLength = target.files.length;
      for (let i = 0; i < filesLength; i++) {
        var check = this.costBOMFiles.find(obj => (target.files !== null && obj.name === target.files[i].name));
        if (!check) {
          if (this.consolidatedBOMFile !== null) {
            this.costBOMFiles.shift();
            this.costBOMFilesList.shift();
          }
          this.costBOMFiles.unshift(target.files[i]);
          this.consolidatedBOMFile = target.files[i].name;
          this.costBOMFilesList.unshift({ name: target.files[i].name, quantity: 1 });
        }
      }
    }
  }

  /** This function select cost BOM file*/
  selectCostBomFiles(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files?.length !== undefined && target.files.length > 0) {
      var filesLength = target.files.length;
      for (let i = 0; i < filesLength; i++) {
        var check = this.costBOMFiles.find(obj => (target.files !== null && obj.name === target.files[i].name));
        if (!check) {
          this.costBOMFiles.push(target.files[i]);
          this.costBOMFilesList.push({ name: target.files[i].name, quantity: 1 });
        }
      }
    }
  }

  /** This function remove cost BOM file*/
  removeCostBOMFiles(index: number) {
    if (index === 0) {
      this.consolidatedBOMFile = null;
    }
    this.costBOMFiles.splice(index, 1);
    this.costBOMFilesList.splice(index, 1);
  }

  /** This function upload cost BOM file*/
  uploadCostBOMFiles(): void {
    if (this.consolidatedBOMFile === null) {
      alert("Please select a consolidated BOM file");
    } else {
      if (this.costBOMFiles.length > 1) {
        const formData = new FormData();
        this.costBOMFiles.forEach((file: any) => {
          formData.append('files', file, file.name);
        });
        formData.append('fileList', JSON.stringify(this.costBOMFilesList));
        formData.append('consolidatedFile', JSON.stringify(this.consolidatedBOMFile));
        formData.append('numberOfSystems', JSON.stringify(this.numSystemsCost));


        // Replace the URL with your backend API endpoint
        this.database.postCostBOMFiles(formData)
          .subscribe((response: any) => {
            if (response.status === 1) {
              console.log(response.message);
              this.database.getConsolidatedCostBOMFile().subscribe((response: Blob) => {
                // Create a URL for the Blob
                const url = window.URL.createObjectURL(response);
                // Create a link element and set its href attribute to the Blob URL
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Consolidated BOM Files.zip'; // Set the desired file name
                document.body.appendChild(a);
                a.click();
                // Clean up
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              }, error => {
                console.error('File download error:', error);
                alert('File download error');
              });
            } else {
              alert("Issue processing files, please try again");
            }
          }, (error: any) => {
            console.error('Error uploading files', error);
            alert('Error uploading files');
          });
      } else {
        alert('Please select at least 1 BOM file');
      }
    }
  }

  /** This function select consolidate BOM file cancel*/
  selectConsolidatedBOMFileCancel(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files?.length !== undefined && target.files.length > 0) {
      if (this.consolidatedBOMFile === null) {
        var check = this.costBOMFiles.find(obj => (target.files !== null && obj.name === target.files[0].name));
        if (!check) {
          if (this.consolidatedBOMFile !== null) {
            this.costBOMFiles.shift();
            this.costBOMFilesList.shift();
          }
          this.costBOMFiles.unshift(target.files[0]);
          this.consolidatedBOMFile = target.files[0].name;
          this.costBOMFilesList.unshift({ name: target.files[0].name, quantity: 1 });
        }
      }
    }
  }

}
