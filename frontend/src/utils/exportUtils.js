/**
 * @fileoverview Export Utilities
 * @description Utilities for exporting data to CSV and PDF formats
 * @author Waste Management System
 * @version 1.0.0
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} columns - Column definitions with header and key
 * @returns {string} CSV string
 */
export const arrayToCSV = (data, columns) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Create header row
  const headers = columns.map(col => col.header).join(',');
  
  // Create data rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = col.key.split('.').reduce((obj, key) => obj?.[key], row);
      
      // Handle different value types
      if (value === null || value === undefined) {
        return '';
      }
      
      // Escape quotes and wrap in quotes if contains comma or newline
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    }).join(',');
  });

  return [headers, ...rows].join('\n');
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Filename without extension
 */
export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, `${filename}.csv`);
  } else {
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Generate and download CSV from data
 * @param {Array} data - Data array
 * @param {Array} columns - Column definitions
 * @param {string} filename - Filename without extension
 */
export const exportToCSV = (data, columns, filename) => {
  const csv = arrayToCSV(data, columns);
  downloadCSV(csv, filename);
};

/**
 * Generate HTML table for PDF export
 * @param {Array} data - Data array
 * @param {Array} columns - Column definitions
 * @param {string} title - Report title
 * @returns {string} HTML string
 */
export const generateHTMLTable = (data, columns, title) => {
  const headerRow = columns.map(col => `<th>${col.header}</th>`).join('');
  
  const bodyRows = data.map(row => {
    const cells = columns.map(col => {
      const value = col.key.split('.').reduce((obj, key) => obj?.[key], row);
      return `<td>${value ?? ''}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1 {
          color: #2c3e50;
          text-align: center;
          margin-bottom: 20px;
        }
        .metadata {
          text-align: center;
          color: #7f8c8d;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #10b981;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        tr:hover {
          background-color: #f3f4f6;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #9ca3af;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="metadata">
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total Records: ${data.length}</p>
      </div>
      <table>
        <thead>
          <tr>${headerRow}</tr>
        </thead>
        <tbody>
          ${bodyRows}
        </tbody>
      </table>
      <div class="footer">
        <p>Waste Management System - Performance Report</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Export to PDF (opens print dialog)
 * @param {Array} data - Data array
 * @param {Array} columns - Column definitions
 * @param {string} title - Report title
 */
export const exportToPDF = (data, columns, title) => {
  const htmlContent = generateHTMLTable(data, columns, title);
  
  // Create a new window with the HTML content
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
};

/**
 * Format date for export
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDateForExport = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '';
  return Number(num).toLocaleString();
};

/**
 * Format percentage
 * @param {number} num - Number to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (num, decimals = 1) => {
  if (num === null || num === undefined) return '';
  return `${Number(num).toFixed(decimals)}%`;
};

/**
 * Export statistics summary to CSV
 * @param {Object} stats - Statistics object
 * @param {string} filename - Filename without extension
 */
export const exportStatsToCSV = (stats, filename) => {
  const data = Object.entries(stats).map(([key, value]) => ({
    metric: key.replace(/([A-Z])/g, ' $1').trim(),
    value: value
  }));

  const columns = [
    { header: 'Metric', key: 'metric' },
    { header: 'Value', key: 'value' }
  ];

  exportToCSV(data, columns, filename);
};

/**
 * Export chart data to CSV
 * @param {Array} chartData - Chart data array
 * @param {string} xKey - Key for x-axis
 * @param {string} yKey - Key for y-axis
 * @param {string} filename - Filename without extension
 */
export const exportChartData = (chartData, xKey, yKey, filename) => {
  const columns = [
    { header: xKey.charAt(0).toUpperCase() + xKey.slice(1), key: xKey },
    { header: yKey.charAt(0).toUpperCase() + yKey.slice(1), key: yKey }
  ];

  exportToCSV(chartData, columns, filename);
};

export default {
  arrayToCSV,
  downloadCSV,
  exportToCSV,
  exportToPDF,
  generateHTMLTable,
  formatDateForExport,
  formatNumber,
  formatPercentage,
  exportStatsToCSV,
  exportChartData
};
