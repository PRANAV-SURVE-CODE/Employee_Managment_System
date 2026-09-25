package com.pranav.employee_managment_system.mapper;

import com.pranav.employee_managment_system.dto.EmployeeDTO;
import com.pranav.employee_managment_system.entity.Employee;
import org.springframework.stereotype.Component;

@Component
public class EmployeeMapper {

    public static EmployeeDTO toDTO(Employee employee) {

        EmployeeDTO dto = new EmployeeDTO();

        dto.setId(employee.getId());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        dto.setAge(employee.getAge());
        dto.setSalary(employee.getSalary());
        dto.setDepartment(employee.getDepartment());
        dto.setDesignation(employee.getDesignation());
        dto.setJoiningDate(employee.getJoiningDate());
        dto.setStatus(employee.getStatus());

        return dto;
    }

    public  Employee toEntity( EmployeeDTO dto) {

        Employee employee = new Employee();

        employee.setId(dto.getId());
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

        return employee;
    }
}

