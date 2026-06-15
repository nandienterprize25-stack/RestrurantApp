import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FoodManagementService } from '../../services/food-management.service';
import { MenuItem } from '../../models/food-management.models';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, ColumnAutoSizeModule, ValidationModule, TextFilterModule, CustomEditorModule } from 'ag-grid-community';
import { LoggingService } from '../../services/logging.service';
import { CustomAlertService } from '../../services/custom-alert.service';

ModuleRegistry.registerModules([ClientSideRowModelModule, PaginationModule, ColumnAutoSizeModule, ValidationModule, TextFilterModule, CustomEditorModule]);

@Component({
    selector: 'app-food-variant-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AgGridAngular],
    templateUrl: './food-variant-list.component.html',
    styleUrls: ['./food-variant-list.component.css']
})
export class FoodVariantListComponent implements OnInit {
    private gridApi!: GridApi;

    variantForm!: FormGroup;
    rowData: any[] = [];
    menuItemsList: MenuItem[] = [];

    isModalOpen: boolean = false;
    isEditMode: boolean = false;
    selectedVariantId: string | null = null;
    private pendingDeleteId: string | null = null; 

    allergensConfig = [
        { key: 'coconut', label: 'Coconut' },
        { key: 'nuts', label: 'Nuts' },
        { key: 'soyabean', label: 'Soyabean' },
        { key: 'sesame', label: 'Sesame' }
    ];

    columnDefs: ColDef[] = [
        {
            headerName: 'Food Item',
            field: 'menuItemName',
            sortable: true,
            filter: true,
            flex: 130,
            valueFormatter: (params) => params.value ? params.value.toUpperCase() : ''
        },
        {
            headerName: 'Variant Size',
            field: 'name',
            sortable: true,
            filter: true,
            flex: 100,
            valueFormatter: (params) => params.value ? params.value.toUpperCase() : ''
        },
        { 
            headerName: 'Price', 
            field: 'price',
            sortable: true, 
            width: 100,
            valueGetter: (params) => params.data?.price !== undefined ? params.data.price : params.data?.Price,
            valueFormatter: (params) => params.value !== undefined ? `₹${params.value}` : '₹0'
        },
        {
            headerName: 'Dietary Type',
            field: 'dietaryType',
            width: 120,
            cellRenderer: (params: any) => {
                const value = params.value || params.data?.DietaryType;
                if (!value) return '';
                const isVeg = value.toLowerCase() === 'veg';
                return isVeg ? 
                    `<span style="color: #15803d; font-weight:700;">🟢 VEG</span>` : 
                    `<span style="color: #b91c1c; font-weight:700;">🔴 NON-VEG</span>`;
            }
        },
        { 
            headerName: 'Spice Level', 
            field: 'spiceLevel', 
            width: 110,
            valueGetter: (params) => params.data?.spiceLevel || params.data?.SpiceLevel 
        },
        {
            headerName: 'Status',
            field: 'isActive',
            width: 100,
            valueGetter: (params) => params.data?.isActive !== undefined ? params.data.isActive : params.data?.IsActive,
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
        this.initializeFormStructure();
    }

    ngOnInit(): void {
        this.loadFormContextData();
    }

    private initializeFormStructure(): void {
        this.variantForm = this.fb.group({
            id: [''],
            menuItemId: [null, Validators.required],
            name: ['', [Validators.required, Validators.maxLength(50)]],
            price: [0, [Validators.required, Validators.min(0)]],
            dietaryType: ['Veg', Validators.required],
            spiceLevel: ['Medium', Validators.required],
            isActive: [true],
            allergens: this.fb.array([false, false, false, false]) 
        });
    }

    get allergensFormArray(): FormArray {
        return this.variantForm.get('allergens') as FormArray;
    }

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
    }

    private loadFormContextData(): void {
        // Fetch menu items from DB to load dropdown options first
        this.foodService.getMenuItems(true).subscribe({
            next: (data) => {
                this.menuItemsList = data;
                // Once dropdown data is safe, refresh variants from the live database
                this.refreshVariantGrid();
            },
            error: (err) => this.logger.logError('Failed to load menu items from database', err)
        });
    }

    refreshVariantGrid(): void {
        // 🔥 LIVE FIX: Fetch dynamic database objects instead of relying on hardcoded arrays
        this.foodService.getFoodVariants().subscribe({
            next: (data) => {
                this.rowData = data.map(item => {
                    // Match up the associated menu item name cleanly
                    const match = this.menuItemsList.find(m => m.id === item.menuItemId || m.id === item.MenuItemId);
                    return {
                        ...item,
                        id: item.id || item.Id,
                        menuItemId: item.menuItemId || item.MenuItemId,
                        menuItemName: match ? match.name : 'Unknown Item',
                        name: item.name || item.Name,
                        price: item.price !== undefined ? item.price : item.Price,
                        dietaryType: item.dietaryType || item.DietaryType || 'Veg',
                        spiceLevel: item.spiceLevel || item.SpiceLevel || 'Medium',
                        isActive: item.isActive !== undefined ? item.isActive : item.IsActive,
                        allergenList: item.allergenList || item.AllergenList || []
                    };
                });
            },
            error: (err) => this.logger.logError('Error pulling data from variants table', err)
        });
    }

    onCellClicked(event: any): void {
        const targetElement = event.event.target as HTMLElement;
        const actionAttr = targetElement.getAttribute('data-action');
        const selectedData = event.data;

        if (actionAttr === 'edit') {
            this.openEditModal(selectedData);
        } else if (actionAttr === 'delete') {
            this.pendingDeleteId = selectedData.id;
            this.alertService.confirm(
                `Are you sure you want to delete this variant configuration?`,
                () => this.executeVariantDeletion(),
                () => this.pendingDeleteId = null
            );
        }
    }

    openCreateModal(): void {
        this.isEditMode = false;
        this.selectedVariantId = null;
        this.variantForm.reset({
            id: '',
            menuItemId: null,
            name: '',
            price: 0,
            dietaryType: 'Veg',
            spiceLevel: 'Medium',
            isActive: true,
            allergens: [false, false, false, false]
        });
        this.isModalOpen = true;
    }

    openEditModal(variant: any): void {
        this.isEditMode = true;
        this.selectedVariantId = variant.id;

        const activeAllergens = variant.allergenList || [];
        const booleanAllergenArray = this.allergensConfig.map(cfg => activeAllergens.includes(cfg.key));

        this.variantForm.patchValue({
            id: variant.id,
            menuItemId: variant.menuItemId,
            name: variant.name,
            price: variant.price,
            dietaryType: variant.dietaryType,
            spiceLevel: variant.spiceLevel,
            isActive: variant.isActive
        });

        this.variantForm.setControl('allergens', this.fb.array(booleanAllergenArray));
        this.isModalOpen = true;
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.selectedVariantId = null;
    }

    saveVariantData(): void {
        if (this.variantForm.invalid) {
            this.variantForm.markAllAsTouched();
            this.alertService.error('Please fill in all required fields.');
            return;
        }

        const rawFormValues = this.variantForm.value;
        const selectedAllergensStrings = this.allergensConfig
            .filter((_, idx) => rawFormValues.allergens[idx])
            .map(cfg => cfg.key);

        const payload = {
            id: this.selectedVariantId,
            menuItemId: rawFormValues.menuItemId,
            name: rawFormValues.name,
            price: rawFormValues.price,
            dietaryType: rawFormValues.dietaryType,
            spiceLevel: rawFormValues.spiceLevel,
            isActive: rawFormValues.isActive,
            allergenList: selectedAllergensStrings
        };

        if (this.isEditMode && this.selectedVariantId) {
            // Live Update DB request
            this.foodService.updateVariant(this.selectedVariantId, payload).subscribe({
                next: () => {
                    this.alertService.success('Variant updated in database successfully!');
                    this.closeModal();
                    this.refreshVariantGrid();
                },
                error: (err) => this.alertService.error(err.error?.message || 'Failed to modify variant row.')
            });
        } else {
            // Live Create DB request
            this.foodService.createVariant(payload).subscribe({
                next: () => {
                    this.alertService.success('New variant added to database successfully!');
                    this.closeModal();
                    this.refreshVariantGrid();
                },
                error: (err) => this.alertService.error(err.error?.message || 'Failed to create variant entry.')
            });
        }
    }

    private executeVariantDeletion(): void {
        if (!this.pendingDeleteId) return;
        
        // Live Delete DB request
        this.foodService.deleteVariant(this.pendingDeleteId).subscribe({
            next: () => {
                this.alertService.success('Variant permanently removed from database.');
                this.pendingDeleteId = null;
                this.refreshVariantGrid();
            },
            error: (err) => {
                this.pendingDeleteId = null;
                this.alertService.error(err.error?.message || 'Could not delete variant option.');
            }
        });
    }
}