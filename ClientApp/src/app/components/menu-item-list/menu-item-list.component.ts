import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodManagementService } from '../../services/food-management.service';
import { Category, MenuItem, FoodVariant, FoodAvailability, GroupItemChild } from '../../models/food-management.models';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, ColumnAutoSizeModule, ValidationModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule, PaginationModule, ColumnAutoSizeModule, ValidationModule]);

@Component({
  selector: 'app-menu-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './menu-item-list.component.html',
  styleUrls: ['./menu-item-list.component.css']
})
export class MenuItemListComponent implements OnInit {
  private gridApi!: GridApi;
  
  // Master Lists Data Cache
  rowData: MenuItem[] = [];
  categories: Category[] = [];
  allAvailableItemsForComboSelection: MenuItem[] = [];

  // Filtering Dropdown
  selectedCategoryFilter: string = '';

  // Modal Display Logic Flags
  isFormModalOpen: boolean = false;
  isEditMode: boolean = false;

  // Active Binding Form Structure Model Template
  currentFormModel: any = {
    id: '',
    name: '',
    description: '',
    imageUrl: '',
    categoryId: '',
    isActive: true,
    isGroupItem: false,
    variants: [] as FoodVariant[],
    availabilities: [] as FoodAvailability[],
    groupComponents: [] as GroupItemChild[]
  };

  // AG-Grid Column Configuration Matrix
  columnDefs: ColDef[] = [
    { headerName: 'Dish Name', field: 'name', sortable: true, filter: true, flex: 2 },
    { headerName: 'Category', field: 'categoryName', sortable: true, filter: true, flex: 1.5 },
    { 
      headerName: 'Type', 
      field: 'isGroupItem', 
      flex: 1,
      valueFormatter: params => params.value ? '📦 Combo Pack' : '🍳 Single Dish'
    },
    {
      headerName: 'Price Range',
      flex: 1.5,
      valueGetter: params => {
        const variants: FoodVariant[] = params.data.variants || [];
        if (variants.length === 0) return '$0.00';
        const prices = variants.map(v => v.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} - $${max.toFixed(2)}`;
      }
    },
    {
      headerName: 'Status',
      field: 'isActive',
      flex: 1,
      cellRenderer: (params: any) => {
        const styleClass = params.value ? 'status-completed' : 'status-pending';
        const labelText = params.value ? 'Active' : 'Inactive';
        return `<span class="grid-badge ${styleClass}">${labelText}</span>`;
      }
    },
    {
      headerName: 'Actions',
      flex: 1,
      cellRenderer: () => {
        return `
          <button class="action-trigger-btn edit-btn" data-action="edit">✏️ Edit</button>
        `;
      }
    }
  ];

  constructor(private foodService: FoodManagementService) {}

  ngOnInit(): void {
    this.loadInitialDashboardMetadata();
  }

  loadInitialDashboardMetadata(): void {
    // 1. Fetch Categories for Dropdowns
    this.foodService.getCategories(true).subscribe(data => this.categories = data);
    
    // 2. Fetch Core Grid Records
    this.refreshGridDataset();
  }

  refreshGridDataset(): void {
    this.foodService.getMenuItems(true, this.selectedCategoryFilter || undefined).subscribe(data => {
      this.rowData = data;
      this.allAvailableItemsForComboSelection = data.filter(item => !item.isGroupItem);
    });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onCellClicked(event: any): void {
    if (event.event.target.getAttribute('data-action') === 'edit') {
      this.openEditForm(event.data);
    }
  }

  // ==========================================
  // FORM & MODAL MANAGEMENT WORKFLOWS
  // ==========================================
  openCreateForm(): void {
    this.isEditMode = false;
    this.currentFormModel = {
      id: '',
      name: '',
      description: '',
      imageUrl: '',
      categoryId: '',
      isActive: true,
      isGroupItem: false,
      variants: [{ variantName: 'Regular', price: 0, taxPercentage: 0 }], // Auto-inject default variation frame
      availabilities: [{ availableFrom: '00:00:00', availableTo: '23:59:59', isAvailableAllDay: true }],
      groupComponents: []
    };
    this.isFormModalOpen = true;
  }

  openEditForm(item: MenuItem): void {
    this.isEditMode = true;
    // Perform deep-copy allocation clone to isolate active changes from ruining active rowStates pre-save
    this.currentFormModel = JSON.parse(JSON.stringify(item));
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
  }

  // --- SUB-FORM CONTROL MATRIX ACTIONS ---
  addVariantRow(): void {
    this.currentFormModel.variants.push({ variantName: '', price: 0, taxPercentage: 0 });
  }

  removeVariantRow(index: number): void {
    if (this.currentFormModel.variants.length > 1) {
      this.currentFormModel.variants.splice(index, 1);
    }
  }

  addAvailabilityRow(): void {
    this.currentFormModel.availabilities.push({ availableFrom: '08:00:00', availableTo: '22:00:00', isAvailableAllDay: false });
  }

  removeAvailabilityRow(index: number): void {
    this.currentFormModel.availabilities.splice(index, 1);
  }
// 👈 ADD THIS HELPER METHOD HERE TO SAFELY RESET SCHEDULE THRESHOLDS
  toggleAllDaySchedule(avail: FoodAvailability): void {
    if (avail.isAvailableAllDay) {
      avail.availableFrom = '00:00:00';
      avail.availableTo = '23:59:59';
    }
  }
  addComboComponentRow(): void {
    this.currentFormModel.groupComponents.push({ childMenuItemId: '', quantity: 1 });
  }

  removeComboComponentRow(index: number): void {
    this.currentFormModel.groupComponents.splice(index, 1);
  }

  // ==========================================
  // PERSISTENCE SUBMISSION PIPELINE (SAVE/UPDATE)
  // ==========================================
  saveFormSubmit(): void {
    // Structural Data Sanitization Validation Guards
    if (!this.currentFormModel.name || !this.currentFormModel.categoryId) {
      alert('⚠️ Missing Entries: Item Name and Category selection are mandatory fields.');
      return;
    }

    if (this.currentFormModel.isGroupItem && this.currentFormModel.groupComponents.length === 0) {
      alert('⚠️ Invalid Combo Matrix: Please append at least one core child dish asset inside combo groups.');
      return;
    }

    if (this.isEditMode) {
      this.foodService.updateMenuItem(this.currentFormModel.id, this.currentFormModel).subscribe({
        next: () => {
          this.closeFormModal();
          this.refreshGridDataset();
        }
      });
    } else {
      this.foodService.createMenuItem(this.currentFormModel).subscribe({
        next: () => {
          this.closeFormModal();
          this.refreshGridDataset();
        }
      });
    }
  }
}