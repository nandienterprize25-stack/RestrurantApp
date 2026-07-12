using RestaurantApp.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RestaurantApp.Application.Interfaces;

public interface IReservationService
{
    Task<IReadOnlyList<ReservationDto>> GetReservationsByTypeAsync(string typeString);
    Task<ReservationDto?> UpsertReservationAsync(ReservationDto dto);
    Task<bool> DeleteReservationAsync(Guid id);
    Task<IReadOnlyList<UnavailabilityDayDto>> GetUnavailabilityDaysAsync();
    Task<UnavailabilityDayDto> AddUnavailabilityAsync(UnavailabilityDayDto dto);
}