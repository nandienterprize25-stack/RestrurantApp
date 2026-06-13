import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FoodManagementService } from '../../services/food-management.service';
import { Category } from '../../models/food-management.models';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, ColumnAutoSizeModule, ValidationModule } from 'ag-grid-community';
import { LoggingService } from '../../services/logging.service';

ModuleRegistry.registerModules([ClientSideRowModelModule, PaginationModule, ColumnAutoSizeModule, ValidationModule]);

@Component({
    selector: 'app-category-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AgGridAngular],
    templateUrl: './category-list.component.html',
    styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
    private gridApi!: GridApi;

    categoryForm!: FormGroup;
    rowData: Category[] = [];
    parentCategoriesList: Category[] = [];

    isModalOpen: boolean = false;
    isEditMode: boolean = false;

    customAlertOpen: boolean = false;
    customAlertTitle: string = '';
    customAlertMessage: string = '';
    private pendingDeleteId: string | null = null; 

    columnDefs: ColDef[] = [
        {
            headerName: 'Image',
            field: 'imageUrl',
            width: 90,
            cellRenderer: (params: any) => {
                const url = params.value || 'https://via.placeholder.com/60';
                return `<div style="display:flex; align-items:center; justify-content:center; height:100%;">
                  <img src="${url}" style="width:38px; height:38px; border-radius:4px; object-fit:cover; border:1px solid #cbd5e1"/>
                </div>`;
            }
        },
        {
            headerName: 'Category Name',
            field: 'name',
            sortable: true,
            filter: true,
            flex: 120,
            valueFormatter: (params) => params.value ? params.value.toUpperCase() : ''
        },
        { headerName: 'Parent Category', field: 'parentCategoryName', sortable: true, filter: true, flex: 100 },
        {
            headerName: 'Status',
            field: 'isActive',
            width: 120,
            cellRenderer: (params: any) => params.value ?
                `<span style="color: #166534; font-weight:700; font-size:12px;">● ACTIVE</span>` :
                `<span style="color: #991b1b; font-weight:700; font-size:12px;">○ INACTIVE</span>`
        },
        {
            headerName: 'Action',
            field: 'id',
            sortable: false,
            filter: false,
            width: 150,
            cellRenderer: (params: any) => {
                return `
                  <div style="display: flex; gap: 8px; align-items: center; justify-content: center; height: 100%;">
                    <button type="button" class="grid-edit-btn" data-action="edit" style="cursor:pointer; background:#3b82f6; color:white; border:none; padding:4px 10px; border-radius:4px; font-size:12px; font-weight:600;">✏️ Edit</button>
                    <button type="button" class="grid-delete-btn" data-action="delete" style="cursor:pointer; background:#ef4444; color:white; border:none; padding:4px 10px; border-radius:4px; font-size:12px; font-weight:600;">🗑️ Delete</button>
                  </div>
                `;
            }
        }
    ];

    constructor(
        private fb: FormBuilder,
        private foodService: FoodManagementService,
        private logger: LoggingService
    ) {
        this.initializeReactiveFormStructure();
    }

    ngOnInit(): void {
        this.refreshCategoriesGrid();
    }

    private initializeReactiveFormStructure(): void {
        this.categoryForm = this.fb.group({
            id: [''],
            name: ['', [Validators.required, Validators.maxLength(100)]],
            description: ['', [Validators.maxLength(500)]],
            imageUrl: [''],
            isActive: [true],
            isOffer: [false],
            parentCategoryId: [null]
        });
    }

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
    }

    refreshCategoriesGrid(): void {
        this.foodService.getCategories(true).subscribe({
            next: (data) => {
                this.rowData = data;
                this.parentCategoriesList = data.filter(c => !c.parentCategoryId);
            },
            error: (err) => {
                this.logger.logError('Failed to pull data context', err);
            }
        });
    }

    onCellClicked(event: any): void {
        const targetElement = event.event.target as HTMLElement;
        const actionAttr = targetElement.getAttribute('data-action');
        const selectedCategoryData = event.data;

        if (actionAttr === 'edit') {
            this.openEditModal(selectedCategoryData);
        } else if (actionAttr === 'delete') {
            this.pendingDeleteId = selectedCategoryData.id;
            this.triggerCustomAlert('Confirm Delete', `Are you sure you want to permanently remove the "${selectedCategoryData.name.toUpperCase()}" category item?`);
        }
    }

    openCreateModal(): void {
        this.isEditMode = false;
        this.categoryForm.reset({
            id: '',
            name: '',
            description: '',
            imageUrl: '',
            isActive: true,
            isOffer: false,
            parentCategoryId: null
        });
        this.isModalOpen = true;
    }

    openEditModal(category: Category): void {
        this.isEditMode = true;
        this.categoryForm.patchValue(category);
        this.isModalOpen = true;
    }

    triggerCustomAlert(title: string, msg: string): void {
        this.customAlertTitle = title;
        this.customAlertMessage = msg;
        this.customAlertOpen = true;
    }

    handleAlertConfirmation(): void {
        const currentTitle = this.customAlertTitle; 
        this.customAlertOpen = false;

        if (currentTitle === 'Confirm Delete' && this.pendingDeleteId) {
            this.foodService.deleteCategory(this.pendingDeleteId).subscribe({
                next: () => {
                    this.pendingDeleteId = null;
                    this.refreshCategoriesGrid();
                    this.triggerCustomAlert('Success Alert', 'The category record was successfully cleared.');
                },
                error: (serverError) => {
                    this.pendingDeleteId = null;
                    const errorMsg = serverError.error?.message || 'Database constraints aborted item removal.';
                    this.triggerCustomAlert('Delete Aborted', errorMsg);
                }
            });
            return;
        }

        if (currentTitle === 'Success Alert' || currentTitle === 'Action Completed') {
            this.closeModal();
            this.refreshCategoriesGrid();
        }

        this.customAlertTitle = '';
        this.customAlertMessage = '';
    }

    closeModal(): void {
        this.isModalOpen = false;
    }

    saveCategoryData(): void {
        if (this.categoryForm.invalid) {
            this.triggerCustomAlert('Validation Alert', 'Please complete all required fields before saving.');
            return;
        }

        const payload = this.categoryForm.value;

        if (this.isEditMode) {
            this.foodService.updateCategory(payload.id, payload).subscribe({
                next: () => {
                    this.logger.logInfo(`Successfully updated record configuration.`);
                    this.triggerCustomAlert('Action Completed', 'Category configuration modifications updated successfully!');
                },
                error: (serverError) => {
                    const localizedMessage = serverError.error?.message || 'Server connection timed out.';
                    this.triggerCustomAlert('Update Denied', localizedMessage);
                }
            });
        } else {
            this.foodService.createCategory(payload).subscribe({
                next: () => {
                    this.logger.logInfo(`Successfully saved entry.`);
                    this.triggerCustomAlert('Action Completed', `Category "${payload.name.toUpperCase()}" has been added smoothly!`);
                },
                error: (serverError) => {
                    const localizedMessage = serverError.error?.message || 'Connection constraint validation failure.';
                    this.triggerCustomAlert('Creation Failure', localizedMessage);
                }
            });
        }
    }

    onFileSelected(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.files && inputElement.files.length > 0) {
            const file: File = inputElement.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                this.categoryForm.patchValue({
                    imageUrl: reader.result as string
                });
            };
            reader.readAsDataURL(file);
        }
    }
}