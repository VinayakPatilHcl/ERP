package com.hospital.erp.pharmacy;

import com.hospital.erp.common.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/pharmacy")
@RequiredArgsConstructor
public class PharmacyController {

    private final MedicineRepository repo;

    public record MedicineDto(
            Long id,
            @NotBlank String sku,
            @NotBlank String name,
            String manufacturer,
            String category,
            String unit,
            BigDecimal unitPrice,
            BigDecimal gstPercent,
            @NotNull Integer stockQuantity,
            Integer reorderLevel,
            LocalDate expiryDate,
            boolean active) {}

    public record StockAdjustment(@NotNull Integer delta, String reason) {}

    @GetMapping("/medicines")
    public Page<MedicineDto> list(@RequestParam(required = false) String q, Pageable pageable) {
        return repo.search(q, pageable).map(this::toDto);
    }

    @GetMapping("/medicines/{id}")
    public MedicineDto get(@PathVariable Long id) {
        return toDto(find(id));
    }

    @GetMapping("/medicines/low-stock")
    public List<MedicineDto> lowStock() {
        return repo.findLowStock().stream().map(this::toDto).toList();
    }

    @PostMapping("/medicines")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public MedicineDto create(@Valid @RequestBody MedicineDto dto) {
        Medicine m = Medicine.builder()
                .sku(dto.sku()).name(dto.name())
                .manufacturer(dto.manufacturer()).category(dto.category()).unit(dto.unit())
                .unitPrice(dto.unitPrice()).gstPercent(dto.gstPercent() == null ? BigDecimal.ZERO : dto.gstPercent())
                .stockQuantity(dto.stockQuantity()).reorderLevel(dto.reorderLevel())
                .expiryDate(dto.expiryDate()).active(true)
                .build();
        return toDto(repo.save(m));
    }

    @PutMapping("/medicines/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public MedicineDto update(@PathVariable Long id, @Valid @RequestBody MedicineDto dto) {
        Medicine m = find(id);
        m.setSku(dto.sku());
        m.setName(dto.name());
        m.setManufacturer(dto.manufacturer());
        m.setCategory(dto.category());
        m.setUnit(dto.unit());
        m.setUnitPrice(dto.unitPrice());
        m.setGstPercent(dto.gstPercent() == null ? BigDecimal.ZERO : dto.gstPercent());
        m.setStockQuantity(dto.stockQuantity());
        m.setReorderLevel(dto.reorderLevel());
        m.setExpiryDate(dto.expiryDate());
        m.setActive(dto.active());
        return toDto(repo.save(m));
    }

    @PostMapping("/medicines/{id}/adjust-stock")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public MedicineDto adjustStock(@PathVariable Long id, @Valid @RequestBody StockAdjustment adj) {
        Medicine m = find(id);
        m.setStockQuantity(Math.max(0, m.getStockQuantity() + adj.delta()));
        return toDto(repo.save(m));
    }

    @DeleteMapping("/medicines/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Medicine m = find(id);
        m.setActive(false);
        repo.save(m);
        return ResponseEntity.noContent().build();
    }

    private Medicine find(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Medicine", id));
    }

    private MedicineDto toDto(Medicine m) {
        return new MedicineDto(m.getId(), m.getSku(), m.getName(), m.getManufacturer(),
                m.getCategory(), m.getUnit(), m.getUnitPrice(), m.getGstPercent(),
                m.getStockQuantity(), m.getReorderLevel(), m.getExpiryDate(), m.isActive());
    }
}
