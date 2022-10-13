/**
 * The names of all Instructions in LEGv8.
 */
export enum InstructionMnemonic {
    Empty = "",
    /**
     * ADD
     */
    ADD = "ADD",
    /**
     * ADD Immediate
     */
    ADDI = "ADDI",
    /**
     * ADD Immediate and Set flags
     */
    ADDIS = "ADDIS",
    /**
     * ADD and Set flags
     */
    ADDS = "ADDS",
    /**
     * AND
     */
    AND = "AND",
    /**
     * AND Immediate
     */
    ANDI = "ANDI",
    /**
     * AND Immediate and Set flags
     */
    ANDIS = "ANDIS",
    /**
     * AND and Set flags
     */
    ANDS = "ANDS",
    /**
     * Branch unconditionally
     */
    B = "B",
    /**
     * Branch if EQual
     */
    B_EQ = "B.EQ",
    /**
     * Branch if Not Equal
     */
    B_NE = "B.NE",
    /**
     * Branch if Less Than
     */
    B_LT = "B.LT",
    /**
     * Branch if Less than or Equal
     */
    B_LE = "B.LE",
    /**
     * Branch if Greater Than
     */
    B_GT = "B.GT",
    /**
     * Branch if Greater than or Equal
     */
    B_GE = "B.GE",
    /**
     * Branch if Higher
     */
    B_HI = "B.HI",
    /**
     * Branch if Higher or Same
     */
    B_HS = "B.HS",
    /**
     * Branch if Lower
     */
    B_LO = "B.LO",
    /**
     * Branch if Lower or Same
     */
    B_LS = "B.LS",
    /**
     * Branch if MInus
     */
    B_MI = "B.MI",
    /**
     * Branch if PLus
     */
    B_PL = "B.PL",
    /**
     * Branch if Set flag
     */
    B_VS = "B.VS",
    /**
     * Branch if Carry flag
     */
    B_VC = "B.VC",
    /**
     * Branch with Link
     */
    BL = "BL",
    /**
     * Branch to Register
     */
    BR = "BR",
    /**
     * Compare and Branch if Not Zero
     */
    CBNZ = "CBNZ",
    /**
     * Compare and Branch if Zero.
     */
    CBZ = "CBZ",
    /**
     * Exclusive OR
     */
    EOR = "EOR",
    /**
     * Exclusive OR Immediate
     */
    EORI = "EORI",
    /**
     * LoaD Register Unscaled offset
     */
    LDUR = "LDUR",
    /**
     * LoaD Byte Unscaled offset
     */
    LDURB = "LDURB",
    /**
     * LoaD Half Unscaled offset
     */
    LDURH = "LDURH",
    /**
     * LoaD Signed Word Unscaled offset
     */
    LDURSW = "LDURSW",
    /**
     * LoaD eXclusive Register
     */
    LDXR = "LDXR",
    /**
     * Logical Shift Left
     */
    LSL = "LSL",
    /**
     * Logical Shift Right
     */
    LSR = "LSR",
    /**
     * MOVe wide with Keep
     */
    MOVK = "MOVK",
    /**
     * MOVe wide with Zero
     */
    MOVZ = "MOVZ",
    /**
     * Inclusive OR
     */
    ORR = "ORR",
    /**
     * Inclusive OR Immediate
     */
    ORRI = "ORRI",
    /**
     * STore Register Unscaled offset
     */
    STUR = "STUR",
    /**
     * STore Byte Unscaled offset
     */
    STURB = "STURB",
    /**
     * STore Half Unscaled offset
     */
    STURH = "STURH",
    /**
     * STore Word Unscaled offset
     */
    STURW = "STURW",
    /**
     * STore eXclusive Register
     */
    STXR = "STXR",
    /**
     * SUBtract
     */
    SUB = "SUB",
    /**
     * SUBtract Immediate
     */
    SUBI = "SUBI",
    /**
     * SUBtract Immediate and Set flags
     */
    SUBIS = "SUBIS",
    /**
     * SUBtract and Set flags
     */
    SUBS = "SUBS",

    FADDS = "FADDS",
    FADDD = "FADDD",
    FCMPS = "FCMPS",
    FCMPD = "FCMPD",
    FDIVS = "FDIVS",
    FDIVD = "FDIVD",
    FMULS = "FMULS",
    FMULD = "FMULD",
    FSUBS = "FSUBS",
    FSUBD = "FSUBD",
    LDURS = "LDURS",
    LDURD = "LDURD",
    MUL = "MUL",
    SDIV = "SDIV",
    SMULH = "SMULH",
    STURS = "STURS",
    STURD = "STURD",
    UDIV = "UDIV",
    UMULH = "UMULH",

    //      PSEUDO INSTRUCTIONS
    /**
     * CoMPare
     */
    CMP = "CMP",
    /**
     * CoMPare Immediate
     */
    CMPI = "CMPI",
    /**
     * 
     */
    LDA = "LDA",
    /**
     * MOVe
     */
    MOV = "MOV",

    //      DEBUG INSTRUCTIONS
    DUMP = "DUMP",
    HALT = "HALT",
    PRNT = "PRNT",
    PRNL = "PRNL",
}