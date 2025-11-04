import { defineConfig, devices } from '@playwright/test';

// Set to true to enable debug logging
const DEBUG = process.env.DEBUG === 'true';

export default defineConfig({
  // Look for test files in the "e2e" directory, relative to this configuration file
  testDir: './e2e',
  
  // Maximum time one test can run for (30 seconds)
  timeout: 30 * 1000,
  
  expect: {
    // Maximum time expect() should wait for the condition to be met
    timeout: 5000
  },
  
  // Run tests in files in parallel (disabled to avoid flakiness)
  fullyParallel: false,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: 1,
  
  // Reporter to use
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Capture screenshot after each test failure
    screenshot: 'only-on-failure',
    
    // Record video for each test
    video: 'on-first-retry',
    
    // Configure viewport
    ...(DEBUG ? {
      viewport: { width: 1280, height: 720 },
      launchOptions: {
        slowMo: 250,
        headless: false
      }
    } : {})
  },
  
  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment other browsers as needed
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  
  // Configure web server for testing
  webServer: !process.env.CI ? {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000, // 2 minutes
    stderr: 'pipe',
    stdout: 'pipe',
    env: {
      NODE_ENV: 'test',
      PORT: '3000',
      NEXT_TELEMETRY_DISABLED: '1'
    }
  } : undefined,
});
