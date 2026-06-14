import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FoodManagementService } from '../../services/food-management.service';
import { MenuItem, Category } from '../../models/food-management.models';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, ColumnAutoSizeModule, ValidationModule, TextFilterModule, CustomEditorModule } from 'ag-grid-community';
import { LoggingService } from '../../services/logging.service';
import { CustomAlertService } from '../../services/custom-alert.service';

// Registered CustomEditorModule to fully prevent AG-Grid layout exceptions
ModuleRegistry.registerModules([ClientSideRowModelModule, PaginationModule, ColumnAutoSizeModule, ValidationModule, TextFilterModule, CustomEditorModule]);

@Component({
    selector: 'app-food-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AgGridAngular],
    templateUrl: './food-list.component.html',
    styleUrls: ['./food-list.component.css']
})
export class FoodListComponent implements OnInit {
    private gridApi!: GridApi;

    foodForm!: FormGroup;
    rowData: MenuItem[] = [];
    categoriesList: Category[] = [];

    isModalOpen: boolean = false;
    isEditMode: boolean = false;

    // THE FIRST-CLICK FIX PATTERN: Tracks the active identity out-of-bounds of form controls
    selectedFoodId: string | null = null;
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
            headerName: 'Food Item Name',
            field: 'name',
            sortable: true,
            filter: true,
            flex: 120,
            valueFormatter: (params) => params.value ? params.value.toUpperCase() : ''
        },
        { headerName: 'Category', field: 'categoryName', sortable: true, filter: true, flex: 100 },
        { 
            headerName: 'Price', 
            field: 'price', 
            sortable: true, 
            width: 100,
            valueFormatter: (params) => params.value ? `₹${params.value}` : '₹0' 
        },
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
        private alertService: CustomAlertService,
        private logger: LoggingService
    ) {
        this.initializeReactiveFormStructure();
    }

    ngOnInit(): void {
        this.loadFormContextData();
        this.refreshFoodGrid();
    }

    private initializeReactiveFormStructure(): void {
        this.foodForm = this.fb.group({
            id: [''],
            name: ['', [Validators.required, Validators.maxLength(100)]],
            description: ['', [Validators.maxLength(500)]],
            price: [0, [Validators.required, Validators.min(0)]],
            imageUrl: [''],
            isActive: [true],
            categoryId: [null, Validators.required]
        });
    }

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
    }

    private loadFormContextData(): void {
        this.foodService.getCategories(true).subscribe({
            next: (data) => this.categoriesList = data,
            error: (err) => this.logger.logError('Failed to load drop-down context categories', err)
        });
    }

    refreshFoodGrid(): void {
        // Maps directly to service endpoint
        this.foodService.getMenuItems(true).subscribe({
            next: (data) => this.rowData = data,
            error: (err) => this.logger.logError('Failed to pull food items context', err)
        });
    }

    onCellClicked(event: any): void {
        const targetElement = event.event.target as HTMLElement;
        const actionAttr = targetElement.getAttribute('data-action');
        const selectedFoodData = event.data;

        if (actionAttr === 'edit') {
            this.openEditModal(selectedFoodData);
        } else if (actionAttr === 'delete') {
            this.pendingDeleteId = selectedFoodData.id;
            this.alertService.confirm(
                `Are you sure you want to permanently remove "${selectedFoodData.name.toUpperCase()}"?`,
                () => this.executeFoodDeletion(),
                () => this.pendingDeleteId = null
            );
        }
    }

    openCreateModal(): void {
        if (this.gridApi) {
            this.gridApi.deselectAll();
            if (typeof this.gridApi.stopEditing === 'function') {
                try { this.gridApi.stopEditing(); } catch (e) {}
            }
        }
        this.isEditMode = false;
        this.selectedFoodId = null;

        this.foodForm.reset({
            id: '',
            name: '',
            description: '',
            price: 0,
            imageUrl: '',
            isActive: true,
            categoryId: null
        });
        this.isModalOpen = true;
    }

    openEditModal(food: MenuItem): void {
        if (this.gridApi) {
            this.gridApi.deselectAll();
            if (typeof this.gridApi.stopEditing === 'function') {
                try { this.gridApi.stopEditing(); } catch (e) {}
            }
        }
        this.isEditMode = true;
        this.selectedFoodId = food.id; // Isolate memory state safely

        this.foodForm.patchValue(food);
        this.isModalOpen = true;
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.selectedFoodId = null;
    }

    saveFoodData(): void {
        if (this.foodForm.invalid) {
            this.foodForm.markAllAsTouched();
            this.alertService.error('Please complete all required fields correctly.');
            return;
        }

        const payload = this.foodForm.value;

        if (this.isEditMode) {
            const targetUpdateId = this.selectedFoodId || payload.id;

            // Updated to reference your service's updateMenuItem
            this.foodService.updateMenuItem(targetUpdateId, payload).subscribe({
                next: () => {
                    this.alertService.success('Food item updated successfully!');
                    this.closeModal();
                    this.refreshFoodGrid();
                },
                error: (serverError) => {
                    const errorMsg = serverError.error?.message || 'Database rejected entity modification.';
                    this.alertService.error(errorMsg);
                }
            });
        } else {
            // Updated to reference your service's createMenuItem
            this.foodService.createMenuItem(payload).subscribe({
                next: () => {
                    this.alertService.success('Food item added successfully!');
                    this.closeModal();
                    this.refreshFoodGrid();
                },
                error: (serverError) => {
                    const errorMsg = serverError.error?.message || 'Failed to save new record.';
                    this.alertService.error(errorMsg);
                }
            });
        }
    }

    private executeFoodDeletion(): void {
        if (!this.pendingDeleteId) return;
        // Updated to reference your service's deleteMenuItem
        this.foodService.deleteMenuItem(this.pendingDeleteId).subscribe({
            next: () => {
                this.pendingDeleteId = null;
                this.refreshFoodGrid();
                this.alertService.success('The record has been permanently removed.');
            },
            error: (serverError) => {
                this.pendingDeleteId = null;
                const errorMsg = serverError.error?.message || 'Deletion constraint failure.';
                this.alertService.error(errorMsg);
            }
        });
    }

    onFileSelected(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.files && inputElement.files.length > 0) {
            const file: File = inputElement.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                this.foodForm.patchValue({
                    imageUrl: reader.result as string
                });
            };
            reader.readAsDataURL(file);
        }
    }
}