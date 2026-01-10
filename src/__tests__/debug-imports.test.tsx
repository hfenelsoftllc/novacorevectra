import React from 'react';
import { render } from '@testing-library/react';

describe('Debug Imports', () => {
  test('should import Button component', () => {
    const { Button } = require('../components/ui/button');
    expect(Button).toBeDefined();
  });

  test('should import CTASection component', () => {
    try {
      const { CTASection } = require('../components/sections/CTASection');
      expect(CTASection).toBeDefined();
    } catch (error) {
      console.error('CTASection import error:', error);
      throw error;
    }
  });

  test('should import ProcessLifecycleSection component', () => {
    try {
      const { ProcessLifecycleSection } = require('../components/sections/ProcessLifecycleSection');
      expect(ProcessLifecycleSection).toBeDefined();
    } catch (error) {
      console.error('ProcessLifecycleSection import error:', error);
      throw error;
    }
  });
});