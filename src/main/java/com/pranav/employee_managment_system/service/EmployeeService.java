package com.pranav.employee_managment_system.service;

import com.pranav.employee_managment_system.dto.EmployeeDTO;
import com.pranav.employee_managment_system.entity.Employee;
import com.pranav.employee_managment_system.exception.EmployeeNotFoundException;
import com.pranav.employee_managment_system.mapper.EmployeeMapper;
import com.pranav.employee_managment_system.repository.EmployeeRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;

    public EmployeeService(EmployeeRepository employeeRepository, EmployeeMapper employeeMapper) {
        this.employeeRepository = employeeRepository;
        this.employeeMapper = employeeMapper;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee with ID " + id + " not found"));
    }

    public EmployeeDTO addEmployee(@Valid EmployeeDTO dto) {
        Employee employee = employeeMapper.toEntity(dto);

        // Assign default values to avoid MySQL NULL violations
        if (employee.getJoiningDate() == null) {
            employee.setJoiningDate(LocalDate.now());
        }
        if (employee.getStatus() == null) {
            employee.setStatus("ACTIVE");
        }
        if (employee.getDesignation() == null) {
            employee.setDesignation("Employee");
        }

        Employee savedEmployee = employeeRepository.save(employee);
        return employeeMapper.toDTO(savedEmployee);
    }

    public EmployeeDTO updateEmployee(Long id, EmployeeDTO dto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee with ID " + id + " not found"));

        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setEmail(dto.getEmail());
        employee.setPhone(dto.getPhone());
        employee.setAge(dto.getAge());
        employee.setSalary(dto.getSalary());
        employee.setDepartment(dto.getDepartment());
        employee.setDesignation(dto.getDesignation());
        employee.setJoiningDate(dto.getJoiningDate());
        employee.setStatus(dto.getStatus());

        Employee updatedEmployee = employeeRepository.save(employee);
        return employeeMapper.toDTO(updatedEmployee);
    }

    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee with ID " + id + " not found"));

        employeeRepository.delete(employee);
    }

    public List<Employee> searchByDepartment(String department) {
        return employeeRepository.findByDepartment(department);
    }


    public List<EmployeeDTO> searchEmployee(String keyword) {
        List<Employee> employees = employeeRepository.searchByName(keyword);
        return employees.stream()
                .map(EmployeeMapper::toDTO)
                .toList();
    }

    public Page<EmployeeDTO> getEmployeesWithPagination(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Employee> employeePage = employeeRepository.findAll(pageable);

        return employeePage.map(EmployeeMapper::toDTO);
    }
}