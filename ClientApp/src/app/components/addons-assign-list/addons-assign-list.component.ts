import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FoodManagementService } from '../../services/food-management.service';
import { CustomAlertService } from '../../services/custom-alert.service';
import { AgGridAngular } from 'ag-grid-angular';
import { 
    ColDef, 
    GridApi, 
    GridReadyEvent, 
    ModuleRegistry, 
    ClientSideRowModelModule, 
    TextFilterModule,
    CellStyleModule // 👈 1. ADD THIS IMPORT 
} from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule, TextFilterModule,CellStyleModule]);

@Component({
    selector: 'app-addons-assign-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AgGridAngular],
    templateUrl: './addons-assign-list.component.html'
})
export class AddonsAssignListComponent implements OnInit {
    private gridApi!: GridApi;
    
    assignmentForm!: FormGroup;
    baseMenuItems: any[] = [];
    globalAddons: any[] = [];
    gridRowData: any[] = [];
    showModal: boolean = false;

    gridColumnDefinitions: ColDef[] = [
        { headerName: 'SL', valueGetter: 'node.rowIndex + 1', width: 70, sortable: false, filter: false },
        { 
            headerName: 'Food Name', 
            field: 'menuItemName', 
            sortable: true, 
            filter: 'agTextColumnFilter', 
            flex: 2,
            cellStyle: { fontWeight: '700', color: '#0f172a' }
        },
        { headerName: 'Add-ons Name', field: 'addonName', sortable: true, filter: 'agTextColumnFilter', flex: 2 },
        { headerName: 'Min Required', field: 'minSelectionsRequired', sortable: true, flex: 1 },
        { headerName: 'Max Allowed', field: 'maxChoicesAllowed', sortable: true, flex: 1 },
        {
            headerName: 'Control Actions Panel',
            field: 'id',
            flex: 1.5,
            sortable: false,
            filter: false,
            cellRenderer: (params: any) => `
                <button class="action-btn delete-btn" data-action="delete" style="padding: 6px 12px; background: #fff5f5; border: 1px solid #fed7d7; border-radius: 4px; font-size: 11px; cursor: pointer; color: #e53e3e; font-weight: 700; height: 32px; display: inline-flex; align-items: center; justify-content: center;">🗑️ Remove Link</button>
            `
        }
    ];

    constructor(
        private fb: FormBuilder,
        private foodService: FoodManagementService,
        private alertService: CustomAlertService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadInitialDependencies();
    }

    private initializeForm(): void {
        // 🌟 UPDATED: Matches exact variable casing models expected by MenuItemAddonsController.cs
        this.assignmentForm = this.fb.group({
            menuItemId: ['', Validators.required],
            addonIds: [[], Validators.required],
            minSelectionsRequired: [0, [Validators.required, Validators.min(0)]],
            maxChoicesAllowed: [1, [Validators.required, Validators.min(1)]],
            isMandatory: [false]
        });
    }

    private loadInitialDependencies(): void {
        this.foodService.getMenuItems(true).subscribe({
            next: (items: any[]) => {
                // 🌟 FIX: Updated case parameters to strictly evaluate native model instances
                this.baseMenuItems = items.filter(x => !x.isGroupItem && !x.isAddon);
                this.globalAddons = items.filter(x => x.isAddon === true);
                
                this.refreshMappingGrid();
            },
            error: () => this.alertService.error('Error compiling food item registries.')
        });
    }

    refreshMappingGrid(): void {
        // Fetch cross-reference table linkages directly from MenuItemAddonsController mapping endpoints
        this.foodService.getAssignedAddons().subscribe({
            next: (mappings: any[]) => {
                const compiledLinks: any[] = [];
                
                mappings.forEach(m => {
                    const parentDish = this.baseMenuItems.find(x => x.id === m.menuItemId);
                    const childModifier = this.globalAddons.find(x => x.id === m.addonId);
                    
                    if (parentDish && childModifier) {
                        compiledLinks.push({
                            id: m.id,
                            menuItemName: parentDish.name,
                            addonName: childModifier.name,
                            minSelectionsRequired: m.minSelectionsRequired,
                            maxChoicesAllowed: m.maxChoicesAllowed
                        });
                    }
                });

                this.gridRowData = compiledLinks;
                if (this.gridApi) {
                    this.gridApi.setGridOption('rowData', this.gridRowData);
                }
            },
            error: () => this.alertService.error('Failed to look up assignment registry indices.')
        });
    }

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
    }

    toggleModal(state: boolean): void {
        this.showModal = state;
        if (!state) {
            this.assignmentForm.reset({
                menuItemId: '',
                addonIds: [],
                minSelectionsRequired: 0,
                maxChoicesAllowed: 1,
                isMandatory: false
            });
        }
    }

    onSubmitAssignment(): void {
        if (this.assignmentForm.invalid) return;

        const payload = this.assignmentForm.value;
        
        // POST mapping array straight down to our isolated MenuItemAddonsController api/menuitemaddons/assign endpoint
        this.foodService.assignAddonsToItem(payload).subscribe({
            next: () => {
                this.alertService.success('Modifier mappings linked successfully.');
                this.toggleModal(false);
                this.refreshMappingGrid();
            },
            error: () => this.alertService.error('Failed to commit relations mapping assignment transaction.')
        });
    }

    onCellClicked(event: any): void {
        if (!event.event || !event.event.target) return;
        const target = event.event.target as HTMLElement;
        const action = target.getAttribute('data-action');

        if (action === 'delete') {
            if (confirm(`Sever modification linkage for ${event.data.addonName} from ${event.data.menuItemName}?`)) {
                this.foodService.deleteAssignmentMapping(event.data.id).subscribe({
                    next: () => {
                        this.alertService.success('Link record dropped successfully.');
                        this.refreshMappingGrid();
                    },
                    error: () => this.alertService.error('Error dropping validation key node mapping.')
                });
            }
        }
    }
}