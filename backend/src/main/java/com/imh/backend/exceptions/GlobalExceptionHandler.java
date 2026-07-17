package com.imh.backend.exceptions;

import com.imh.backend.dtos.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {


    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            BadRequestException ex,
            HttpServletRequest request
    ){

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.builder()
                        .status(400)
                        .message(ex.getMessage())
                        .timestamp(LocalDateTime.now())
                        .path(request.getRequestURI())
                        .build());
    }


    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request
    ){

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.builder()
                        .status(404)
                        .message(ex.getMessage())
                        .timestamp(LocalDateTime.now())
                        .path(request.getRequestURI())
                        .build());
    }


    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(
            UnauthorizedException ex,
            HttpServletRequest request
    ){

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.builder()
                        .status(401)
                        .message(ex.getMessage())
                        .timestamp(LocalDateTime.now())
                        .path(request.getRequestURI())
                        .build());
    }


    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(
            ConflictException ex,
            HttpServletRequest request
    ){

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ErrorResponse.builder()
                        .status(409)
                        .message(ex.getMessage())
                        .timestamp(LocalDateTime.now())
                        .path(request.getRequestURI())
                        .build());
    }


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ){

        Map<String,String> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );


        return ResponseEntity
                .badRequest()
                .body(ErrorResponse.builder()
                        .status(400)
                        .message("Validation failed")
                        .errors(errors)
                        .timestamp(LocalDateTime.now())
                        .path(request.getRequestURI())
                        .build());
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleServerError(
            Exception ex,
            HttpServletRequest request
    ){

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.builder()
                        .status(500)
                        .message("Something went wrong. Please try again later.")
                        .timestamp(LocalDateTime.now())
                        .path(request.getRequestURI())
                        .build());
    }

}