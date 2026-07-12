using Microsoft.AspNetCore.Mvc;
using RestaurantApp.Application.DTOs;
using RestaurantApp.Application.Interfaces;
using System;
using System.Threading.Tasks;

namespace RestaurantApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationController : ControllerBase
{
    private readonly IReservationService _service;

    // 🌟 INJECT VIA CONTRACT INTERFACE
    public ReservationController(IReservationService service)
    {
        _service = service;
    }

    [HttpGet("type/{type}")]
    public async Task<IActionResult> GetByReservationType(string type)
    {
        var results = await _service.GetReservationsByTypeAsync(type);
        return Ok(results);
    }

    [HttpPost]
    public async Task<IActionResult> UpsertReservation([FromBody] ReservationDto dto)
    {
        var result = await _service.UpsertReservationAsync(dto);
        if (result == null) return NotFound(new { message = "Target reservation payload entity modification point lost." });
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteReservation(Guid id)
    {
        var succeeded = await _service.DeleteReservationAsync(id);
        if (!succeeded) return BadRequest(new { message = "Failed to drop target reservation log index." });
        return Ok(new { message = "Reservation removed from system registry tracking." });
    }

    [HttpGet("unavailability")]
    public async Task<IActionResult> GetUnavailabilitySheet()
    {
        var list = await _service.GetUnavailabilityDaysAsync();
        return Ok(list);
    }

    [HttpPost("unavailability")]
    public async Task<IActionResult> AddUnavailabilityWindow([FromBody] UnavailabilityDayDto dto)
    {
        var created = await _service.AddUnavailabilityAsync(dto);
        return CreatedAtAction(nameof(GetUnavailabilitySheet), created);
    }
}