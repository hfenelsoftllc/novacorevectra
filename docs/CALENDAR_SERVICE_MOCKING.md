# Calendar Service Mocking Implementation

## Overview

This document describes the comprehensive calendar service mocking implementation that was created to properly mock the calendar service for testing purposes, specifically for CTASection component tests.

## Files Created

### 1. Mock Files

#### `__mocks__/calendarService.js`
- Jest manual mock for calendar service
- Provides default mock implementations for all calendar service methods
- Can be used across tests by placing in the `__mocks__` directory

#### `src/__mocks__/services/calendarService.ts`
- TypeScript mock implementation with proper type support
- Includes all calendar service methods with realistic mock behavior
- Exports both CalendarService class and calendarService instance

### 2. Utility Files

#### `src/utils/test/mockCalendarService.ts`
- Centralized mock utilities for creating different types of calendar service mocks
- Includes functions for:
  - `createMockCalendarService()` - Standard mock with success responses
  - `createFailingMockCalendarService()` - Mock that simulates failures
  - `createErrorMockCalendarService()` - Mock that simulates network errors
  - `setupCalendarServiceMock()` - Helper for setting up mocks in tests

## Implementation Details

### Mocked Methods

All calendar service methods are properly mocked:

1. **`createConsultationEvent(data: ConsultationRequest): Promise<boolean>`**
   - Validates required fields (email, firstName, lastName, company)
   - Returns `true` for valid data, `false` for invalid data
   - Can be configured to simulate failures or errors

2. **`getAvailableTimeSlots(date: string, timezone?: string): Promise<string[]>`**
   - Returns business hours time slots for weekdays
   - Returns empty array for weekends
   - Includes realistic time slots (9:00 AM - 5:00 PM)

3. **`isTimeSlotAvailable(dateTime: string, timezone?: string): Promise<boolean>`**
   - Returns `false` for weekends and outside business hours
   - Returns `true` for valid business hours on weekdays
   - Includes proper date/time validation

4. **`cancelEvent(eventId: string): Promise<boolean>`**
   - Returns `true` for successful cancellation
   - Can be configured to simulate failures

5. **`rescheduleEvent(eventId: string, newDateTime: string): Promise<boolean>`**
   - Checks if new time slot is available using `isTimeSlotAvailable`
   - Returns boolean based on availability
   - Includes proper validation logic

6. **`getBusinessDaysBetween(startDate: Date, endDate: Date): Date[]`**
   - Returns array of business days (Monday-Friday) between dates
   - Excludes weekends
   - Handles edge cases like same-day ranges

### Integration Test Updates

The integration test (`src/__tests__/integration/high-priority-features.test.tsx`) was updated with:

1. **Comprehensive Mock Setup**
   ```typescript
   jest.mock('@/services/calendarService', () => {
     const mockService = {
       createConsultationEvent: jest.fn().mockResolvedValue(true),
       getAvailableTimeSlots: jest.fn().mockResolvedValue([...]),
       isTimeSlotAvailable: jest.fn().mockResolvedValue(true),
       cancelEvent: jest.fn().mockResolvedValue(true),
       rescheduleEvent: jest.fn().mockResolvedValue(true),
       getBusinessDaysBetween: jest.fn().mockReturnValue([...])
     };

     return {
       CalendarService: jest.fn().mockImplementation(() => mockService),
       calendarService: mockService
     };
   });
   ```

2. **Proper Mock Reset in beforeEach**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks();
     
     // Re-setup mock return values after clearing mocks
     mockCalendarService.createConsultationEvent.mockResolvedValue(true);
     mockCalendarService.getAvailableTimeSlots.mockResolvedValue([...]);
     // ... other mock setups
   });
   ```

## Key Features

### 1. Realistic Mock Behavior
- Mocks include proper validation logic
- Business rules are enforced (weekends, business hours)
- Realistic response times and data structures

### 2. Comprehensive Coverage
- All public methods of the calendar service are mocked
- Both success and failure scenarios are supported
- Error conditions can be simulated

### 3. Type Safety
- TypeScript mocks maintain proper type definitions
- Import/export compatibility with the real service
- Proper Jest mock function types

### 4. Flexibility
- Multiple mock configurations available
- Easy to customize for specific test scenarios
- Centralized utilities for consistent mocking

### 5. Test Integration
- Works seamlessly with existing test infrastructure
- Proper cleanup and reset between tests
- Compatible with Jest's mocking system

## Usage Examples

### Basic Usage in Tests
```typescript
import { calendarService } from '@/services/calendarService';

jest.mock('@/services/calendarService');
const mockCalendarService = calendarService as jest.Mocked<typeof calendarService>;

beforeEach(() => {
  jest.clearAllMocks();
  mockCalendarService.createConsultationEvent.mockResolvedValue(true);
});
```

### Using Utility Functions
```typescript
import { createMockCalendarService, createFailingMockCalendarService } from '@/utils/test/mockCalendarService';

// Standard mock
const mockService = createMockCalendarService();

// Failing mock for error scenarios
const failingMock = createFailingMockCalendarService();
```

### Custom Mock Overrides
```typescript
import { createMockCalendarService } from '@/utils/test/mockCalendarService';

const customMock = createMockCalendarService({
  createConsultationEvent: jest.fn().mockResolvedValue(false),
  getAvailableTimeSlots: jest.fn().mockResolvedValue([])
});
```

## Verification

The calendar service mocking has been verified to work correctly:

1. **Mock Functions Created**: All methods are properly mocked with Jest mock functions
2. **Return Values Set**: Mock functions return appropriate values for different scenarios
3. **Type Compatibility**: Mocks maintain TypeScript compatibility
4. **Test Integration**: Successfully integrates with existing test infrastructure
5. **Realistic Behavior**: Mocks simulate realistic calendar service behavior

## Status

✅ **COMPLETED**: Calendar service mocking is properly implemented and ready for use in CTASection component tests and other integration tests.

The calendar service is now comprehensively mocked with:
- All methods covered
- Realistic behavior simulation
- Proper error handling
- Type safety maintained
- Easy-to-use utilities provided
- Integration test compatibility verified