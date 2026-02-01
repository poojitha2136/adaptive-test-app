// Function to report web performance metrics (optional)
const reportWebVitals = onPerfEntry => {

  // Check if a callback function is provided
  if (onPerfEntry && onPerfEntry instanceof Function) {

    // Dynamically import web-vitals library
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {

      // Cumulative Layout Shift – visual stability
      getCLS(onPerfEntry);

      // First Input Delay – user interaction responsiveness
      getFID(onPerfEntry);

      // First Contentful Paint – loading performance
      getFCP(onPerfEntry);

      // Largest Contentful Paint – main content load time
      getLCP(onPerfEntry);

      // Time to First Byte – server response time
      getTTFB(onPerfEntry);
    });
  }
};

// Export function for optional performance monitoring
export default reportWebVitals;
