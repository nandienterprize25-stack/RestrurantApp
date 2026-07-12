using RestaurantApp.Application.DTOs;
using RestaurantApp.Application.Interfaces;
using RestaurantApp.Core.Entities;
using RestaurantApp.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RestaurantApp.Application.Services;

public class ReservationService : IReservationService
{
    private readonly IUnitOfWork _uow;

    public ReservationService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<IReadOnlyList<ReservationDto>> GetReservationsByTypeAsync(string typeString)
    {
        Enum.TryParse(typeString, true, out ReservationType targetType);
        var list = await _uow.Reservations.GetAllAsync(r => r.Type == targetType, r => r.Items);
        return list.Select(MapToDto).ToList();
    }

    public async Task<ReservationDto?> UpsertReservationAsync(ReservationDto dto)
    {
        Enum.TryParse(dto.Type, true, out ReservationType targetType);
        Reservation? entity;

        if (dto.Id.HasValue && dto.Id != Guid.Empty)
        {
            entity = await _uow.Reservations.GetAsync(r => r.Id == dto.Id.Value, r => r.Items);
            if (entity == null) return null;

            foreach (var existingItem in entity.Items.ToList())
            {
                _uow.ReservationItems.Remove(existingItem);
            }

            entity.CustomerName = dto.CustomerName;
            entity.CustomerEmail = dto.CustomerEmail;
            entity.CustomerAddress = dto.CustomerAddress;
            entity.PhoneNo = dto.PhoneNo;
            entity.GuestName = dto.GuestName;
            entity.GuestPhone = dto.GuestPhone;
            entity.TableNo = dto.TableNo;
            entity.NumberOfPeople = dto.NumberOfPeople;
            entity.BookingDate = DateTime.Parse(dto.BookingDate);
            entity.StartTime = TimeSpan.Parse(dto.StartTime);
            entity.EndTime = TimeSpan.Parse(dto.EndTime);
            entity.Category = dto.Category;
            entity.Status = dto.Status;
            entity.AdvancedAmount = dto.AdvancedAmount;
            entity.TotalAmount = dto.TotalAmount;
            entity.PaymentMode = dto.PaymentMode;
            entity.PaymentDate = string.IsNullOrEmpty(dto.PaymentDate) ? null : DateTime.Parse(dto.PaymentDate);

            _uow.Reservations.Update(entity);
        }
        else
        {
            var existingItems = await _uow.Reservations.GetAllAsync();
            int nextSl = existingItems.Count > 0 ? existingItems.Max(r => r.Sl) + 1 : 1;

            entity = new Reservation
            {
                Sl = nextSl,
                CustomerName = dto.CustomerName,
                CustomerEmail = dto.CustomerEmail,
                CustomerAddress = dto.CustomerAddress,
                PhoneNo = dto.PhoneNo,
                GuestName = dto.GuestName,
                GuestPhone = dto.GuestPhone,
                TableNo = dto.TableNo,
                NumberOfPeople = dto.NumberOfPeople,
                BookingDate = DateTime.Parse(dto.BookingDate),
                StartTime = TimeSpan.Parse(dto.StartTime),
                EndTime = TimeSpan.Parse(dto.EndTime),
                Category = dto.Category,
                Status = dto.Status,
                Type = targetType,
                AdvancedAmount = dto.AdvancedAmount,
                TotalAmount = dto.TotalAmount,
                PaymentMode = dto.PaymentMode,
                PaymentDate = string.IsNullOrEmpty(dto.PaymentDate) ? null : DateTime.Parse(dto.PaymentDate)
            };

            await _uow.Reservations.AddAsync(entity);
        }

        if (dto.Items != null)
        {
            foreach (var itemDto in dto.Items)
            {
                entity.Items.Add(new ReservationItem
                {
                    ReservationId = entity.Id,
                    Sl = itemDto.Sl,
                    Date = DateTime.Parse(itemDto.Date),
                    RoomNo = itemDto.RoomNo,
                    Category = itemDto.Category,
                    MenuName = itemDto.MenuName,
                    Qty = itemDto.Qty,
                    Total = itemDto.Total
                });
            }
        }

        await _uow.CompleteAsync();
        return MapToDto(entity);
    }

    public async Task<bool> DeleteReservationAsync(Guid id)
    {
        var entity = await _uow.Reservations.GetAsync(r => r.Id == id, r => r.Items);
        if (entity == null) return false;

        foreach (var item in entity.Items.ToList())
        {
            _uow.ReservationItems.Remove(item);
        }

        _uow.Reservations.Remove(entity);
        return await _uow.CompleteAsync() > 0;
    }

    public async Task<IReadOnlyList<UnavailabilityDayDto>> GetUnavailabilityDaysAsync()
    {
        var data = await _uow.UnavailabilityDays.GetAllAsync();
        return data.Select(u => new UnavailabilityDayDto
        {
            Id = u.Id,
            Sl = u.Sl,
            UnavailableDate = u.UnavailableDate.ToString("yyyy-MM-dd"),
            StartTime = u.StartTime.ToString(@"hh\:mm"),
            EndTime = u.EndTime.ToString(@"hh\:mm"),
            Status = u.Status
        }).ToList();
    }

    public async Task<UnavailabilityDayDto> AddUnavailabilityAsync(UnavailabilityDayDto dto)
    {
        var data = await _uow.UnavailabilityDays.GetAllAsync();
        int nextSl = data.Count > 0 ? data.Max(x => x.Sl) + 1 : 1;

        var entity = new UnavailabilityDay
        {
            Sl = nextSl,
            UnavailableDate = DateTime.Parse(dto.UnavailableDate),
            StartTime = TimeSpan.Parse(dto.StartTime),
            EndTime = TimeSpan.Parse(dto.EndTime),
            Status = dto.Status
        };

        await _uow.UnavailabilityDays.AddAsync(entity);
        await _uow.CompleteAsync();
        
        dto.Id = entity.Id;
        dto.Sl = entity.Sl;
        return dto;
    }

    private ReservationDto MapToDto(Reservation r) => new()
    {
        Id = r.Id,
        Sl = r.Sl,
        CustomerName = r.CustomerName,
        CustomerEmail = r.CustomerEmail,
        CustomerAddress = r.CustomerAddress,
        PhoneNo = r.PhoneNo,
        GuestName = r.GuestName,
        GuestPhone = r.GuestPhone,
        TableNo = r.TableNo,
        NumberOfPeople = r.NumberOfPeople,
        BookingDate = r.BookingDate.ToString("yyyy-MM-dd"),
        StartTime = r.StartTime.ToString(@"hh\:mm"),
        EndTime = r.EndTime.ToString(@"hh\:mm"),
        Category = r.Category,
        Status = r.Status,
        Type = r.Type.ToString(),
        AdvancedAmount = r.AdvancedAmount,
        TotalAmount = r.TotalAmount,
        PaymentMode = r.PaymentMode,
        PaymentDate = r.PaymentDate?.ToString("yyyy-MM-dd"),
        Items = r.Items.Select(i => new ReservationItemDto
        {
            Sl = i.Sl,
            Date = i.Date.ToString("yyyy-MM-dd"),
            RoomNo = i.RoomNo,
            Category = i.Category,
            MenuName = i.MenuName,
            Qty = i.Qty,
            Total = i.Total
        }).ToList()
    };
}