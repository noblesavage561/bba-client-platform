import { classify, classifyFromContent } from "@/lib/ingestion/classifier";
import { extract, extractPeriodFromFilename } from "@/lib/ingestion/extractor";
import { analyzeBankStatement } from "@/lib/ingestion/bank-analyzer";

describe("Document Classifier", () => {
  describe("classify()", () => {
    it("classifies bank statement by filename", () => {
      const result = classify("Chase_Bank_Statement_Dec2023.pdf");
      expect(result.documentType).toBe("BANK_STATEMENT");
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it("classifies account statement as bank statement", () => {
      const result = classify("Account_Statement_Jan2024.pdf");
      expect(result.documentType).toBe("BANK_STATEMENT");
    });

    it("classifies tax return by 1040 pattern", () => {
      const result = classify("Form_1040_2022.pdf");
      expect(result.documentType).toBe("TAX_RETURN");
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it("classifies W-2 document", () => {
      const result = classify("W-2_2023_Employer.pdf");
      expect(result.documentType).toBe("W2");
    });

    it("classifies W2 without hyphen", () => {
      const result = classify("W2_Tax_Form.pdf");
      expect(result.documentType).toBe("W2");
    });

    it("classifies 1099 document", () => {
      const result = classify("1099-NEC_2023.pdf");
      expect(result.documentType).toBe("FORM_1099");
    });

    it("classifies K-1 document", () => {
      const result = classify("Schedule_K-1_2023.pdf");
      expect(result.documentType).toBe("K1");
    });

    it("classifies articles of incorporation", () => {
      const result = classify("Articles_of_Incorporation_ACME_LLC.pdf");
      expect(result.documentType).toBe("FORMATION_DOC");
    });

    it("classifies operating agreement", () => {
      const result = classify("Operating_Agreement_2020.pdf");
      expect(result.documentType).toBe("FORMATION_DOC");
    });

    it("classifies EIN letter", () => {
      const result = classify("EIN_Letter_IRS.pdf");
      expect(result.documentType).toBe("FORMATION_DOC");
    });

    it("classifies invoice", () => {
      const result = classify("Invoice_2024_001.pdf");
      expect(result.documentType).toBe("INVOICE");
    });

    it("classifies contract", () => {
      const result = classify("Service_Agreement_Client.pdf");
      expect(result.documentType).toBe("CONTRACT");
    });

    it("classifies driver's license", () => {
      const result = classify("Drivers_License_Copy.jpg", "image/jpeg");
      expect(result.documentType).toBe("ID_DOCUMENT");
    });

    it("returns OTHER for unrecognized files", () => {
      const result = classify("miscellaneous_document.pdf");
      expect(result.documentType).toBe("OTHER");
    });
  });

  describe("classifyFromContent()", () => {
    it("classifies bank statement from content keywords", () => {
      const content = "Bank Statement for Business Checking Account\nBeginning Balance: $5,000.00\nEnding Balance: $8,200.00";
      const result = classifyFromContent("document.pdf", content);
      expect(result.documentType).toBe("BANK_STATEMENT");
    });

    it("classifies form 1040 from content", () => {
      const content = "Form 1040 U.S. Individual Income Tax Return 2022\nAdjusted Gross Income: $95,000";
      const result = classifyFromContent("doc.pdf", content);
      expect(result.documentType).toBe("TAX_RETURN");
    });

    it("classifies W2 from content keywords", () => {
      const content = "Wages, tips, other compensation 45000\nEmployee's SSN: XXX-XX-1234\nEmployer's EIN: 12-3456789";
      const result = classifyFromContent("doc.pdf", content);
      expect(result.documentType).toBe("W2");
    });

    it("prioritizes filename classification when high confidence", () => {
      const content = "some generic text content with no clear type";
      const result = classifyFromContent("Bank_Statement_Dec23.pdf", content);
      expect(result.documentType).toBe("BANK_STATEMENT");
    });
  });
});

describe("Period Extractor", () => {
  it("extracts month and year from filename with abbreviation", () => {
    const period = extractPeriodFromFilename("Chase_Bank_Statement_Dec2023.pdf");
    expect(period).toBeDefined();
    expect(period?.toLowerCase()).toContain("dec");
    expect(period).toContain("2023");
  });

  it("extracts month and year with underscore separator", () => {
    const period = extractPeriodFromFilename("Statement_Jan_2024.pdf");
    expect(period).toBeDefined();
  });

  it("returns undefined for filenames without date", () => {
    const period = extractPeriodFromFilename("generic_document.pdf");
    expect(period).toBeUndefined();
  });
});

describe("Field Extractor", () => {
  it("extracts bank statement data from text", () => {
    const text = `
      Chase Business Checking Account Statement
      Statement Period: December 2023
      Beginning Balance: $5,200.00
      Ending Balance: $8,450.00
      
      12/05/2023 SQUARE PAYMENT 1,200.00 6,400.00
      12/10/2023 ACH DEBIT RENT -2,500.00 3,900.00
      12/15/2023 WIRE TRANSFER 5,000.00 8,900.00
    `;
    const result = extract("BANK_STATEMENT", "Chase_Dec23.pdf", text);
    expect(result.documentType).toBe("BANK_STATEMENT");
    expect(result.beginningBalance).toBe(5200);
    expect(result.endingBalance).toBe(8450);
  });

  it("extracts tax return data from text", () => {
    const text = `
      Tax Year: 2022
      Total Income: $125,000
      Net Profit: $45,000
    `;
    const result = extract("TAX_RETURN", "Tax_Return_2022.pdf", text);
    expect(result.documentType).toBe("TAX_RETURN");
    expect(result.taxYear).toBe("2022");
    expect(result.totalIncome).toBe(125000);
    expect(result.netProfit).toBe(45000);
  });

  it("extracts W2 data from text", () => {
    const text = `
      Wages, tips, other compensation 72,500
      Federal income tax withheld 14,500
      Employer's name: Apex Technologies Inc
    `;
    const result = extract("W2", "W2_2023.pdf", text);
    expect(result.documentType).toBe("W2");
    expect(result.wages).toBe(72500);
    expect(result.federalTaxWithheld).toBe(14500);
  });
});

describe("Bank Statement Analyzer", () => {
  const sampleExtractedData = {
    documentType: "BANK_STATEMENT" as const,
    period: "December 2023",
    beginningBalance: 5000,
    endingBalance: 8500,
    transactions: [
      { date: "12/05", description: "SQUARE PAYMENT", amount: 3500, type: "credit" as const },
      { date: "12/10", description: "STRIPE PAYMENT", amount: 2800, type: "credit" as const },
      { date: "12/01", description: "RENT PAYMENT", amount: 2500, type: "debit" as const },
      { date: "12/15", description: "RENT PAYMENT", amount: 2500, type: "debit" as const }, // recurring
      { date: "12/20", description: "UTILITY BILL", amount: 250, type: "debit" as const },
    ],
  };

  it("calculates total deposits correctly", () => {
    const result = analyzeBankStatement(sampleExtractedData, "statement.pdf");
    expect(result.totalDeposits).toBe(6300); // 3500 + 2800
  });

  it("calculates total withdrawals correctly", () => {
    const result = analyzeBankStatement(sampleExtractedData, "statement.pdf");
    expect(result.totalWithdrawals).toBe(5250); // 2500 + 2500 + 250
  });

  it("calculates net cashflow correctly", () => {
    const result = analyzeBankStatement(sampleExtractedData, "statement.pdf");
    expect(result.netCashflow).toBe(1050); // 6300 - 5250
  });

  it("detects recurring transactions", () => {
    const result = analyzeBankStatement(sampleExtractedData, "statement.pdf");
    const recurring = result.recurringTransactions;
    expect(recurring.length).toBeGreaterThan(0);
    // RENT PAYMENT appears twice
    const rentRecurring = recurring.find((r) => r.description.toLowerCase().includes("rent"));
    expect(rentRecurring).toBeDefined();
    expect(rentRecurring?.occurrences).toBe(2);
  });

  it("returns zero overdraft count when no overdrafts", () => {
    const result = analyzeBankStatement(sampleExtractedData, "statement.pdf");
    expect(result.overdraftCount).toBe(0);
  });

  it("generates lender ready summary", () => {
    const result = analyzeBankStatement(sampleExtractedData, "statement.pdf");
    expect(result.lenderReadySummary).toBeDefined();
    expect(result.lenderReadySummary.cashflowTrend).toBe("POSITIVE");
    expect(result.lenderReadySummary.overdraftRisk).toBe("LOW");
    expect(result.lenderReadySummary.keyStrengths.length).toBeGreaterThan(0);
  });

  it("detects overdrafts from description", () => {
    const dataWithOverdraft = {
      ...sampleExtractedData,
      transactions: [
        ...sampleExtractedData.transactions,
        { date: "12/22", description: "OVERDRAFT FEE", amount: 35, type: "debit" as const },
      ],
    };
    const result = analyzeBankStatement(dataWithOverdraft, "statement.pdf");
    expect(result.overdraftCount).toBeGreaterThan(0);
  });

  it("uses period from filename when not in extracted data", () => {
    const dataWithoutPeriod = { ...sampleExtractedData, period: undefined };
    const result = analyzeBankStatement(dataWithoutPeriod, "Chase_Jan2024.pdf");
    expect(result.period).toContain("Jan");
  });

  it("marks overdraft risk as HIGH for 3+ overdrafts", () => {
    const dataWithManyOverdrafts = {
      ...sampleExtractedData,
      transactions: [
        ...sampleExtractedData.transactions,
        { date: "12/22", description: "OVERDRAFT FEE", amount: 35, type: "debit" as const },
        { date: "12/23", description: "NSF FEE", amount: 35, type: "debit" as const },
        { date: "12/24", description: "RETURNED PAYMENT NSF", amount: 35, type: "debit" as const },
      ],
    };
    const result = analyzeBankStatement(dataWithManyOverdrafts, "statement.pdf");
    expect(result.lenderReadySummary.overdraftRisk).toBe("HIGH");
  });
});
