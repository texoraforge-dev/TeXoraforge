/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TextbookChapter {
  id: string;
  chapterNumber: number;
  title: string;
  gradeLevel?: 'JSS 1' | 'JSS 2' | 'JSS 3' | 'SSS 1' | 'SSS 2' | 'SSS 3' | 'Senior Secondary (SSS 1-3)';
  estimatedReadTime: string;
  summary: string;
  keyConcepts: string[];
  formulasOrRules?: string[];
  contentSections: {
    heading: string;
    subheading?: string;
    body: string;
    workedExamples?: {
      problem: string;
      stepByStepSolution: string[];
      answer: string;
    }[];
    diagramDescription?: string;
    keyTakeaway?: string;
  }[];
  reviewQuestions: {
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    type: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY';
  }[];
}

export interface DigitalTextbook {
  id: string;
  title: string;
  author: string;
  edition: string;
  subject: string;
  curriculum: string; // e.g. "NERDC / WAEC / NECO / JAMB"
  coverColor: string;
  accentColor: string;
  gradeLevels: string[];
  description: string;
  isbn: string;
  totalChapters: number;
  chapters: TextbookChapter[];
}

export const COMPLETE_DIGITAL_TEXTBOOKS: DigitalTextbook[] = [
  // 1. MODERN BIOLOGY
  {
    id: 'tb_modern_biology',
    title: 'Modern Biology for Senior Secondary Schools',
    author: 'Sarojini T. Ramalingam, Ph.D. & Editorial Board',
    edition: 'Revised Comprehensive African Edition (NERDC / WAEC / NECO Standard)',
    subject: 'Biology',
    curriculum: 'NERDC / WAEC / NECO / JAMB UTME',
    coverColor: 'from-emerald-900 via-teal-950 to-slate-950',
    accentColor: 'emerald',
    gradeLevels: ['SSS 1', 'SSS 2', 'SSS 3', 'Senior Secondary (SSS 1-3)'],
    description: 'The authoritative, complete textbook covering biological principles, cell physiology, plant & animal anatomy, ecology of West Africa, genetics, evolution, and applied biology for senior secondary education.',
    isbn: '978-978-175-301-4',
    totalChapters: 8,
    chapters: [
      {
        id: 'bio_ch1',
        chapterNumber: 1,
        title: 'Cell Biology, Microscopy & Organization of Life',
        gradeLevel: 'SSS 1',
        estimatedReadTime: '25 mins',
        summary: 'Detailed examination of prokaryotic and eukaryotic cells, organelles, light and electron microscopy, and the cellular hierarchy of living organisms.',
        keyConcepts: [
          'Cell Theory: All organisms are composed of one or more cells (Schleiden & Schwann, Virchow)',
          'Ultrastructure of plant vs animal cells (Cellulose wall, chloroplasts, large central vacuole vs centrioles and small vacuoles)',
          'Functions of organelles: Mitochondria (ATP synthesis), Ribosomes (protein synthesis), Endoplasmic Reticulum, Golgi body, Lysosomes',
          'Levels of biological organization: Single-celled (Amoeba, Chlamydomonas) → Colony (Volvox) → Filamentous (Spirogyra) → Tissue (Epidermis, Muscle) → Organ (Heart, Leaf) → System (Digestive, Vascular)'
        ],
        formulasOrRules: [
          'Magnification = Image Size ÷ Actual Size (M = I / A)',
          'Resolution limit of light microscope: ~0.2 µm; Electron microscope: ~0.1 nm'
        ],
        contentSections: [
          {
            heading: '1.1 Discovery & Principles of the Cell Theory',
            body: 'Robert Hooke (1665) first coined the term "cell" observing cork slices. The unified cell theory formulated in 1839 by Matthias Schleiden and Theodor Schwann states: (1) All living organisms are composed of one or more cells; (2) The cell is the fundamental structural and functional unit of life; (3) Rudolf Virchow (1855) added that all living cells arise from pre-existing cells (Omnis cellula e cellula).',
            keyTakeaway: 'Cells are the fundamental units of structure, physiology, and reproduction in all living organisms.'
          },
          {
            heading: '1.2 Comparative Cytology: Plant vs Animal Cells',
            body: 'Plant cells possess a rigid cellulose cell wall outside the plasma membrane, providing turgor pressure resistance and structural support. They also feature plastids (chloroplasts containing chlorophyll for photosynthesis, chromoplasts, and amyloplasts/leucoplasts) and a single prominent permanent vacuole surrounded by the tonoplast membrane. In contrast, animal cells lack a cell wall, store carbohydrate as glycogen rather than starch, have non-permanent microvacuoles, and contain paired centrioles active in spindle formation during mitosis.',
            workedExamples: [
              {
                problem: 'Under a light microscope, a plant cell with an actual length of 40 µm appears as 8 mm in a micrograph. Calculate the magnification power.',
                stepByStepSolution: [
                  'Step 1: Convert units to the same scale: 8 mm = 8,000 µm.',
                  'Step 2: Apply the magnification formula: Magnification = Image Size / Actual Size.',
                  'Step 3: Magnification = 8,000 µm / 40 µm = 200×.'
                ],
                answer: 'Magnification is 200×.'
              }
            ]
          },
          {
            heading: '1.3 Organelle Structure and Metabolic Roles',
            body: 'The mitochondrion features a double membrane; the inner membrane is folded into cristae to maximize surface area for electron transport chain enzymes producing adenosine triphosphate (ATP). The nucleus contains chromatin (DNA and histones) and the nucleolus where rRNA and ribosomal subunits are assembled. Ribosomes translate mRNA into polypeptide chains. The rough endoplasmic reticulum (RER) modifies synthesized proteins, while the smooth endoplasmic reticulum (SER) synthesizes lipids and phospholipids and detoxifies metabolic byproducts.'
          }
        ],
        reviewQuestions: [
          {
            question: 'Which of the following organelles is responsible for the synthesis of adenosine triphosphate (ATP) in eukaryotic cells?',
            options: ['Ribosome', 'Mitochondrion', 'Golgi Apparatus', 'Lysosome'],
            correctAnswer: 'Mitochondrion',
            explanation: 'Mitochondria are the powerhouses of the cell where aerobic respiration (Krebs cycle and oxidative phosphorylation) occurs to yield ATP.',
            type: 'MULTIPLE_CHOICE'
          },
          {
            question: 'State two structural differences between a typical plant cell and an animal cell.',
            correctAnswer: 'Plant cells have a cellulose cell wall, chloroplasts, and a large permanent vacuole, whereas animal cells lack a cell wall and chloroplasts and contain centrioles.',
            explanation: 'Cell wall and chloroplasts are exclusive diagnostic features of photosynthetic plant cells.',
            type: 'SHORT_ANSWER'
          }
        ]
      },
      {
        id: 'bio_ch2',
        chapterNumber: 2,
        title: 'Plant and Animal Nutrition, Digestive Enzymes & Metabolism',
        gradeLevel: 'SSS 1',
        estimatedReadTime: '28 mins',
        summary: 'Autotrophic photosynthesis (light and dark reactions), mineral nutrition in plants, holozoic human digestive anatomy, and digestive enzyme actions.',
        keyConcepts: [
          'Autotrophic Nutrition: Light-dependent reactions in thylakoid membranes (photolysis of water) & Light-independent Calvin cycle in stroma',
          'Equation for Photosynthesis: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂',
          'Human alimentary canal: Mouth (Ptyalin/Salivary amylase) → Stomach (Pepsin, HCl) → Duodenum (Pancreatic amylase, Trypsin, Lipase, Bile) → Ileum (Erepsin, Maltase, Sucrase, Lactase)',
          'Villi & Microvilli adaptation for nutrient absorption into bloodstream and lacteals'
        ],
        formulasOrRules: [
          'Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (requires chlorophyll & sunlight)',
          'Enzyme Action Rate: Optimal Temperature (~37°C for human enzymes) & pH specificity (Pepsin pH 1.5-2.0, Trypsin pH 8.0)'
        ],
        contentSections: [
          {
            heading: '2.1 The Biochemistry of Photosynthesis',
            body: 'Photosynthesis occurs within the chloroplasts of palisade and spongy mesophyll cells. In the light-dependent phase, photons strike chlorophyll pigments in the thylakoids, exciting electrons and driving the photolysis of water: 2H₂O → 4H⁺ + 4e⁻ + O₂. This generates ATP and NADPH. In the light-independent (dark) phase (Calvin cycle) in the stroma, CO₂ is fixed by Ribulose-1,5-bisphosphate carboxylase-oxygenase (RuBisCO) to synthesize triose phosphate and glucose.',
            keyTakeaway: 'Photolysis generates oxygen gas as a byproduct, while chemical energy is stored in glucose covalent bonds.'
          },
          {
            heading: '2.2 Human Holozoic Digestion and Enzyme Specificity',
            body: 'Digestion begins in the mouth where salivary amylase (ptyalin) converts cooked starch into maltose under neutral pH. In the stomach, gastric glands secrete hydrochloric acid (HCl), which kills ingested pathogens, provides an acidic pH (~2.0), and activates pepsinogen into pepsin to cleave proteins into peptones and polypeptides. The stomach also secretes rennin in infants to curdle milk protein caseinogen.'
          }
        ],
        reviewQuestions: [
          {
            question: 'During photosynthesis, oxygen is released as a byproduct during which stage?',
            options: ['Calvin cycle', 'Photolysis of water in the light stage', 'Glycolysis', 'Dark reaction'],
            correctAnswer: 'Photolysis of water in the light stage',
            explanation: 'Water molecules are split by light energy absorbed by chlorophyll in the thylakoid membranes, releasing O₂.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'bio_ch3',
        chapterNumber: 3,
        title: 'Transport Systems, Blood Composition & Circulatory Dynamics',
        gradeLevel: 'SSS 2',
        estimatedReadTime: '30 mins',
        summary: 'Internal transport mechanisms in vascular plants (xylem, phloem, transpiration stream) and the mammalian closed double circulatory system.',
        keyConcepts: [
          'Plant Vascular Tissues: Xylem vessels & tracheids (water and mineral ions via transpiration pull, root pressure, capillarity); Phloem sieve tubes & companion cells (translocation of sucrose and amino acids)',
          'Composition of Human Blood: 55% Plasma, 45% Formed elements (Erythrocytes, Leukocytes: Granulocytes & Agranulocytes, Thrombocytes/Platelets)',
          'ABO Blood Group System and Rhesus Factor (Antigens A, B, D and antibodies anti-A, anti-B)',
          'Double Circulatory System: Pulmonary circulation (Heart → Lungs → Heart) and Systemic circulation (Heart → Body → Heart)'
        ],
        formulasOrRules: [
          'Cardiac Output = Stroke Volume × Heart Rate (CO = SV × HR)',
          'Blood Clotting Cascade: Thromboplastin + Ca²⁺ + Prothrombin → Thrombin; Thrombin + Fibrinogen → Insoluble Fibrin mesh'
        ],
        contentSections: [
          {
            heading: '3.1 Vascular Transport in Higher Plants',
            body: 'Water and dissolved mineral salts are absorbed through root hair cells by osmosis and diffusion, moving across the cortex and endodermis into xylem vessels. The upward movement is powered predominantly by Transpiration Pull—the suction force generated by evaporation of water from stomata—aided by the cohesive forces between water molecules and adhesive forces between water and xylem walls (Dixon-Joly cohesion-tension theory).',
            keyTakeaway: 'Transpiration pull is the primary driving force for sap ascent in tall trees.'
          },
          {
            heading: '3.2 Mammalian Heart & Hemodynamics',
            body: 'The mammalian heart is a muscular four-chambered double pump. Deoxygenated blood returns from the body via the superior and inferior vena cava into the right atrium, passes through the tricuspid valve into the right ventricle, and is pumped via the pulmonary artery to the lungs. Oxygenated blood from the lungs enters the left atrium via pulmonary veins, moves across the bicuspid (mitral) valve into the thick-walled left ventricle, and is discharged under high pressure through the aorta into systemic circulation.'
          }
        ],
        reviewQuestions: [
          {
            question: 'A person with blood group O negative is regarded as a universal donor because their red blood cells contain:',
            options: ['Both Antigen A and B', 'Neither Antigen A nor Antigen B nor Rh antigen', 'Both Anti-A and Anti-B antigens', 'Antibody A only'],
            correctAnswer: 'Neither Antigen A nor Antigen B nor Rh antigen',
            explanation: 'Group O negative red blood cells lack A, B, and Rh surface antigens, so recipient antibodies will not agglutinate them.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'bio_ch4',
        chapterNumber: 4,
        title: 'Genetics, Mendelian Inheritance & Molecular Heredity',
        gradeLevel: 'SSS 3',
        estimatedReadTime: '32 mins',
        summary: 'Mendel’s Laws of Inheritance, monohybrid and dihybrid crosses, sex determination, sex-linked inheritance (hemophilia, color blindness), DNA structure, and genetic engineering.',
        keyConcepts: [
          'Mendel’s First Law (Law of Segregation): Alleles for a trait segregate during gamete formation so that each gamete carries only one allele.',
          'Mendel’s Second Law (Law of Independent Assortment): Alleles of different genes assort independently during gamete formation.',
          'Monohybrid phenotypic ratio: 3:1 (dominant to recessive); Genotypic ratio: 1:2:1 (TT : Tt : tt)',
          'Dihybrid phenotypic ratio: 9:3:3:1 in F2 generation of heterozygous dihybrids',
          'Sex-linked traits on the non-homologous region of the X chromosome: Hemophilia, Red-Green Color Blindness'
        ],
        formulasOrRules: [
          'Punnett Square analysis for monohybrid (4 boxes) and dihybrid (16 boxes) crosses',
          'Probability of independent genetic events: P(A and B) = P(A) × P(B)'
        ],
        contentSections: [
          {
            heading: '4.1 Mendelian Principles and Monohybrid Crosses',
            body: 'Gregor Mendel conducted hybridization experiments on the garden pea (Pisum sativum). When true-breeding tall pea plants (TT) are crossed with true-breeding dwarf plants (tt), all F1 offspring are heterozygous tall (Tt). When F1 individuals are self-pollinated, the F2 generation exhibits a 3:1 phenotypic ratio (3 Tall : 1 Dwarf) and a 1:2:1 genotypic ratio (1 TT : 2 Tt : 1 tt).',
            workedExamples: [
              {
                problem: 'A man heterozygous for sickle cell anemia (HbA HbS) marries a carrier woman (HbA HbS). Determine the probability of having a child with full sickle cell disease (HbS HbS).',
                stepByStepSolution: [
                  'Step 1: Write parental genotypes: Father = HbA HbS, Mother = HbA HbS.',
                  'Step 2: Gametes produced by each: 1/2 HbA, 1/2 HbS.',
                  'Step 3: Offspring combinations: 1/4 HbA HbA (Normal), 2/4 HbA HbS (Sickle Trait / Carrier), 1/4 HbS HbS (Sickle Cell Anemia).',
                  'Step 4: Probability of HbS HbS child = 1/4 or 25%.'
                ],
                answer: '25% (1 in 4 chance).'
              }
            ]
          }
        ],
        reviewQuestions: [
          {
            question: 'What is the expected phenotypic ratio in the F2 generation of a classic Mendelian dihybrid cross?',
            options: ['3:1', '1:2:1', '9:3:3:1', '1:1:1:1'],
            correctAnswer: '9:3:3:1',
            explanation: 'Under independent assortment of two heterozygous gene pairs, the F2 phenotypic ratio is 9 dominant-dominant : 3 dominant-recessive : 3 recessive-dominant : 1 recessive-recessive.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      }
    ]
  },

  // 2. NEW SCHOOL CHEMISTRY
  {
    id: 'tb_new_school_chemistry',
    title: 'New School Chemistry for Senior Secondary Schools',
    author: 'Osei Yaw Ababio, M.Sc. (Ed.)',
    edition: 'Standard African Secondary Edition (NERDC / WAEC / NECO / JAMB Compliant)',
    subject: 'Chemistry',
    curriculum: 'NERDC / WAEC / NECO / JAMB UTME',
    coverColor: 'from-blue-950 via-cyan-950 to-slate-950',
    accentColor: 'blue',
    gradeLevels: ['SSS 1', 'SSS 2', 'SSS 3', 'Senior Secondary (SSS 1-3)'],
    description: 'The definitive Nigerian and West African senior chemistry textbook, featuring thorough coverage of physical, inorganic, and organic chemistry with complete quantitative problem solving and experimental procedures.',
    isbn: '978-978-208-011-9',
    totalChapters: 9,
    chapters: [
      {
        id: 'chem_ch1',
        chapterNumber: 1,
        title: 'Atomic Structure, Chemical Periodicity & Quantum Configuration',
        gradeLevel: 'SSS 1',
        estimatedReadTime: '28 mins',
        summary: 'Fundamental particles of matter, isotopes, electronic configurations using s, p, d, f orbitals, Aufbau principle, Pauli exclusion principle, Hund’s rule, and periodic trends.',
        keyConcepts: [
          'Subatomic Particles: Protons (mass 1, charge +1), Neutrons (mass 1, charge 0), Electrons (mass 1/1836, charge -1)',
          'Atomic Number (Z) = number of protons; Mass Number (A) = protons + neutrons',
          'Isotopy: Atoms of the same element with the same atomic number but different mass numbers due to differing neutrons (e.g. ³⁵₁₇Cl and ³⁷₁₇Cl)',
          'Aufbau Principle: Electrons fill subshells of lowest available energy first (1s < 2s < 2p < 3s < 3p < 4s < 3d)',
          'Periodic Trends: Atomic radius decreases across a period and increases down a group; Ionization energy and Electronegativity increase across a period and decrease down a group'
        ],
        formulasOrRules: [
          'Relative Atomic Mass (Ar) = Σ (% Abundance × Isotopic Mass) ÷ 100',
          'Maximum number of electrons in principal shell n = 2n²'
        ],
        contentSections: [
          {
            heading: '1.1 The Quantum Mechanical Model of the Atom',
            body: 'Electrons occupy orbitals—regions of space around the nucleus where the probability of finding an electron is maximum. The s-subshell holds 1 orbital (max 2 electrons), p-subshell holds 3 degenerate orbitals (px, py, pz; max 6 electrons), d-subshell holds 5 orbitals (max 10 electrons), and f-subshell holds 7 orbitals (max 14 electrons). Pauli’s Exclusion Principle states that no two electrons in an atom can have the same four quantum numbers. Hund’s Rule requires that degenerate orbitals are occupied singly with parallel spins before pairing.',
            workedExamples: [
              {
                problem: 'Chlorine exists naturally as two isotopes: ³⁵Cl (75% abundance) and ³⁷Cl (25% abundance). Calculate the relative atomic mass of chlorine.',
                stepByStepSolution: [
                  'Step 1: Apply formula: Ar = [(75 × 35) + (25 × 37)] / 100.',
                  'Step 2: Calculate numerator: (2625 + 925) = 3550.',
                  'Step 3: Divide by 100: 3550 / 100 = 35.5.'
                ],
                answer: '35.5 g/mol (or a.m.u).'
              }
            ]
          }
        ],
        reviewQuestions: [
          {
            question: 'What is the electronic configuration of the Iron(II) ion (Fe²⁺), given that atomic number of Fe is 26?',
            options: ['1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁴', '1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁶', '1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹ 3d⁵', '1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁸'],
            correctAnswer: '1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁶',
            explanation: 'When neutral Fe (1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶) ionizes to Fe²⁺, the two 4s valence electrons are lost first, leaving 3d⁶.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'chem_ch2',
        chapterNumber: 2,
        title: 'Stoichiometry, The Mole Concept & Volumetric Titration Analysis',
        gradeLevel: 'SSS 1',
        estimatedReadTime: '35 mins',
        summary: 'Avogadro’s constant, molar mass, empirical and molecular formulas, molar gas volume at STP, stoichiometry in chemical reactions, and acid-base volumetric titration calculations.',
        keyConcepts: [
          'Avogadro’s Number: 1 mole = 6.022 × 10²³ particles (atoms, molecules, or ions)',
          'Molar Gas Volume at STP: 1 mole of any ideal gas occupies 22.4 dm³ (or 22,400 cm³) at Standard Temperature and Pressure (273 K, 101.3 kPa)',
          'Concentration (Molarity) = Amount in moles (n) ÷ Volume in dm³ (V); C = n / V',
          'Volumetric Analysis Formula: (Ca × Va) / (Cb × Vb) = na / nb'
        ],
        formulasOrRules: [
          'n = mass (g) / Molar Mass (g/mol)',
          'n = Volume of Gas at STP (dm³) / 22.4 dm³',
          'Concentration (g/dm³) = Concentration (mol/dm³) × Molar Mass (g/mol)',
          '(Ca × Va) / (Cb × Vb) = na / nb'
        ],
        contentSections: [
          {
            heading: '2.1 Moles, Chemical Equations and Limiting Reactants',
            body: 'A chemical equation represents the stoichiometry of a reaction on a molecular and molar scale. In any chemical reaction, the stoichiometric coefficients indicate the relative mole ratios of reactants consumed and products formed.',
            workedExamples: [
              {
                problem: '25.0 cm³ of 0.100 mol/dm³ NaOH solution was titrated against hydrochloric acid (HCl) solution of unknown concentration. The average titre volume of HCl required for neutralization was 20.0 cm³. Calculate the concentration of the HCl solution.',
                stepByStepSolution: [
                  'Step 1: Write balanced equation: HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l). Mole ratio na/nb = 1/1.',
                  'Step 2: Identify variables: Cb = 0.100 M, Vb = 25.0 cm³, Va = 20.0 cm³, na = 1, nb = 1.',
                  'Step 3: Apply titration equation: (Ca × Va) / (Cb × Vb) = na / nb → (Ca × 20.0) / (0.100 × 25.0) = 1 / 1.',
                  'Step 4: Solve for Ca: Ca = (0.100 × 25.0) / 20.0 = 2.50 / 20.0 = 0.125 mol/dm³.'
                ],
                answer: '0.125 mol/dm³.'
              }
            ]
          }
        ],
        reviewQuestions: [
          {
            question: 'What volume of oxygen gas at STP is produced by the complete decomposition of 2 moles of potassium trioxochlorate(V), KClO₃? (2KClO₃ → 2KCl + 3O₂)',
            options: ['22.4 dm³', '44.8 dm³', '67.2 dm³', '89.6 dm³'],
            correctAnswer: '67.2 dm³',
            explanation: '2 moles of KClO₃ yield 3 moles of O₂. At STP, 3 moles × 22.4 dm³/mole = 67.2 dm³.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'chem_ch3',
        chapterNumber: 3,
        title: 'Electrochemistry, Redox Reactions & Electrolysis Laws',
        gradeLevel: 'SSS 2',
        estimatedReadTime: '30 mins',
        summary: 'Oxidation numbers, redox half-equations, electrochemical cells, standard electrode potentials (E°), and Faraday’s First and Second Laws of Electrolysis.',
        keyConcepts: [
          'Redox definitions: Oxidation is loss of electrons (OIL) or increase in oxidation state; Reduction is gain of electrons (RIG) or decrease in oxidation state',
          'Faraday’s 1st Law: Mass of substance deposited or liberated (m) is directly proportional to quantity of electric charge (Q = I × t); m = Z × I × t',
          'Faraday’s Constant: 1 Faraday (F) = 96,500 Coulombs ≈ charge of 1 mole of electrons',
          'Electrochemical series and selective discharge of ions during electrolysis (Position, Concentration, Nature of Electrodes)'
        ],
        formulasOrRules: [
          'Q = I × t (Charge in Coulombs = Current in Amperes × Time in seconds)',
          'm = (Molar Mass × I × t) / (n × F) where n = number of electrons transferred',
          'E°cell = E°cathode - E°anode (Standard cell electromotive force)'
        ],
        contentSections: [
          {
            heading: '3.1 Quantitative Aspects of Electrolysis (Faraday’s Laws)',
            body: 'Faraday’s laws govern quantitative deposition during electrolysis. To deposit 1 mole of a univalent ion (e.g. Ag⁺ + e⁻ → Ag), 1 Faraday (96,500 C) is required. For a bivalent ion (e.g. Cu²⁺ + 2e⁻ → Cu), 2 Faradays (2 × 96,500 C) are required.',
            workedExamples: [
              {
                problem: 'Calculate the mass of copper deposited at the cathode when a steady current of 2.0 A is passed through copper(II) tetraoxosulphate(VI) solution for 1 hour 20 minutes. (Cu = 64, 1 F = 96,500 C).',
                stepByStepSolution: [
                  'Step 1: Convert time to seconds: t = (1 × 3600) + (20 × 60) = 3600 + 1200 = 4800 s.',
                  'Step 2: Calculate total charge Q = I × t = 2.0 A × 4800 s = 9600 C.',
                  'Step 3: Cathode reaction: Cu²⁺ + 2e⁻ → Cu. 2 moles of electrons (2 × 96,500 C = 193,000 C) deposit 1 mole of Cu (64 g).',
                  'Step 4: Mass deposited = (64 g × 9600 C) / 193,000 C = 614,400 / 193,000 = 3.183 g.'
                ],
                answer: '3.18 g of Copper.'
              }
            ]
          }
        ],
        reviewQuestions: [
          {
            question: 'How many Faradays of electricity are required to deposit 0.5 mole of aluminum from molten Al₂O₃? (Al³⁺ + 3e⁻ → Al)',
            options: ['0.5 F', '1.0 F', '1.5 F', '3.0 F'],
            correctAnswer: '1.5 F',
            explanation: '1 mole of Al requires 3 Faradays. Therefore, 0.5 mole of Al requires 0.5 × 3 = 1.5 F.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'chem_ch4',
        chapterNumber: 4,
        title: 'Organic Chemistry: Hydrocarbons, Functional Groups & Polymers',
        gradeLevel: 'SSS 3',
        estimatedReadTime: '35 mins',
        summary: 'IUPAC nomenclature, alkanes, alkenes, alkynes, aromatic benzene, alcohols, alkanoic acids, esters, saponification, carbohydrates, and synthetic polymers.',
        keyConcepts: [
          'Homologous Series: Family of organic compounds sharing the same general formula, identical functional group, graduated physical properties, and similar chemical behavior',
          'Alkanes (CnH2n+2): Saturated, substitution reactions (halogenation via free radical mechanism)',
          'Alkenes (CnH2n) and Alkynes (CnH2n-2): Unsaturated, electrophilic addition reactions (decolorization of bromine water and acidified KMnO4)',
          'Esterification: Alkanoic acid + Alkanol ⇌ Ester + Water (in the presence of conc. H₂SO₄ catalyst)'
        ],
        formulasOrRules: [
          'Alkanes: CnH2n+2; Alkenes: CnH2n; Alkynes: CnH2n-2; Alkanols: CnH2n+1OH; Alkanoic Acids: CnH2n+1COOH',
          'Combustion of Hydrocarbon: CxHy + (x + y/4)O₂ → xCO₂ + (y/2)H₂O'
        ],
        contentSections: [
          {
            heading: '4.1 IUPAC Rules & Functional Group Chemistry',
            body: 'Organic compounds are systematically named by identifying the longest continuous carbon chain (stem), numbering from the end closest to the principal functional group or lowest substituent numbers, and adding prefixes for alkyl branches and suffixes for the functional group.',
            keyTakeaway: 'The functional group determines the chemical reactivity of an organic molecule.'
          }
        ],
        reviewQuestions: [
          {
            question: 'Which of the following compounds will decolorize bromine water in the dark?',
            options: ['Ethane', 'Ethene', 'Propane', 'Cyclohexane'],
            correctAnswer: 'Ethene',
            explanation: 'Ethene contains an unsaturated carbon-carbon double bond (>C=C<) which undergoes rapid electrophilic addition with bromine, decolorizing it.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      }
    ]
  },

  // 3. NEW SCHOOL PHYSICS
  {
    id: 'tb_new_school_physics',
    title: 'New School Physics for Senior Secondary Schools',
    author: 'M. W. Anyakoha, Ph.D. & Senior Editorial Panel',
    edition: 'Standard African Secondary Edition (NERDC / WAEC / NECO / JAMB Compliant)',
    subject: 'Physics',
    curriculum: 'NERDC / WAEC / NECO / JAMB UTME',
    coverColor: 'from-violet-950 via-purple-950 to-slate-950',
    accentColor: 'purple',
    gradeLevels: ['SSS 1', 'SSS 2', 'SSS 3', 'Senior Secondary (SSS 1-3)'],
    description: 'The master reference physics textbook for West African senior secondary schools, presenting clear physics principles, mathematical derivations, worked examples, and practical laboratory guidance across mechanics, waves, optics, heat, electricity, magnetism, and modern physics.',
    isbn: '978-978-175-882-8',
    totalChapters: 9,
    chapters: [
      {
        id: 'phy_ch1',
        chapterNumber: 1,
        title: 'Units, Dimensions, Kinematics & Rectilinear Motion',
        gradeLevel: 'SSS 1',
        estimatedReadTime: '30 mins',
        summary: 'Fundamental and derived physical quantities, dimensional analysis, scalar and vector mechanics, linear equations of uniformly accelerated motion, and projectile trajectory equations.',
        keyConcepts: [
          'Fundamental Quantities: Length (m, [L]), Mass (kg, [M]), Time (s, [T]), Electric Current (A, [I]), Temperature (K, [θ]), Amount of substance (mol, [N]), Luminous intensity (cd, [J])',
          'Dimensional Analysis: Checking consistency of physical equations and deriving relationships',
          'Four Equations of Uniform Motion: (1) v = u + at; (2) s = ut + ½at²; (3) v² = u² + 2as; (4) s = ½(u + v)t',
          'Projectile Motion: Horizontal motion (vx = u cos θ, sx = u cos θ · t); Vertical motion under gravity (vy = u sin θ - gt)'
        ],
        formulasOrRules: [
          'Time of flight: T = (2u sin θ) / g',
          'Maximum height: H = (u² sin² θ) / (2g)',
          'Horizontal Range: R = (u² sin 2θ) / g (Maximum when θ = 45°)'
        ],
        contentSections: [
          {
            heading: '1.1 Dimensional Formulae & Homogeneity Principle',
            body: 'The dimension of a physical quantity shows how it is constructed from fundamental base units. The principle of dimensional homogeneity states that every term on both sides of a physically valid equation must have the identical dimensional formula.',
            workedExamples: [
              {
                problem: 'A stone is projected with an initial velocity of 40 m/s at an angle of 30° to the horizontal ground. Calculate (a) the time of flight, and (b) the horizontal range. (Take g = 10 m/s²).',
                stepByStepSolution: [
                  'Step 1: Identify given parameters: u = 40 m/s, θ = 30°, g = 10 m/s².',
                  'Step 2: Time of flight T = (2u sin θ) / g = (2 × 40 × sin 30°) / 10 = (80 × 0.5) / 10 = 40 / 10 = 4.0 s.',
                  'Step 3: Range R = (u² sin 2θ) / g = (40² × sin 60°) / 10 = (1600 × 0.866) / 10 = 1385.6 / 10 = 138.56 m.'
                ],
                answer: 'Time of flight = 4.0 s; Range = 138.6 m.'
              }
            ]
          }
        ],
        reviewQuestions: [
          {
            question: 'What is the dimensional formula for Work or Energy in terms of mass [M], length [L], and time [T]?',
            options: ['[M L T⁻¹]', '[M L² T⁻²]', '[M L T⁻²]', '[M L² T⁻¹]'],
            correctAnswer: '[M L² T⁻²]',
            explanation: 'Work = Force × Distance = (Mass × Acceleration) × Distance = [M] × [L T⁻²] × [L] = [M L² T⁻²].',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'phy_ch2',
        chapterNumber: 2,
        title: 'Dynamics, Newton’s Laws of Motion, Momentum & Simple Machines',
        gradeLevel: 'SSS 1',
        estimatedReadTime: '28 mins',
        summary: 'Newton’s three laws of motion, linear momentum and impulse, conservation of momentum in elastic and inelastic collisions, friction, and mechanics of simple machines.',
        keyConcepts: [
          'Newton’s First Law (Inertia): An object remains at rest or in uniform motion in a straight line unless acted upon by a net external force.',
          'Newton’s Second Law: Force = rate of change of momentum; F = m × a (when mass is constant)',
          'Newton’s Third Law (Action-Reaction): To every action force, there is an equal in magnitude and opposite in direction reaction force.',
          'Law of Conservation of Linear Momentum: Total momentum before collision = Total momentum after collision in an isolated system: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂',
          'Machine Parameters: Mechanical Advantage (MA = Load / Effort); Velocity Ratio (VR = Distance of Effort / Distance of Load); Efficiency (η = [MA / VR] × 100%)'
        ],
        formulasOrRules: [
          'F = ma; Impulse J = F × Δt = Δp = m(v - u)',
          'Efficiency η = (MA / VR) × 100% = (Work Output / Work Input) × 100%'
        ],
        contentSections: [
          {
            heading: '2.1 Momentum Conservation in Ballistics & Collisions',
            body: 'When two bodies collide in the absence of net external forces, momentum is strictly conserved. In an elastic collision, kinetic energy is also conserved. In an inelastic collision, bodies coalesce or deform, converting kinetic energy into heat/sound, but momentum remains conserved.',
            workedExamples: [
              {
                problem: 'A bullet of mass 0.02 kg is fired horizontally with a muzzle velocity of 500 m/s from a rifle of mass 4.0 kg. Calculate the recoil velocity of the rifle.',
                stepByStepSolution: [
                  'Step 1: State conservation of momentum: Total initial momentum = Total final momentum.',
                  'Step 2: Initial momentum = 0 (system at rest).',
                  'Step 3: Final momentum: (m_bullet × v_bullet) + (m_rifle × v_rifle) = 0.',
                  'Step 4: (0.02 × 500) + (4.0 × v_rifle) = 0 → 10 + 4.0(v_rifle) = 0 → v_rifle = -10 / 4.0 = -2.5 m/s.'
                ],
                answer: 'Recoil velocity is 2.5 m/s in the backwards direction.'
              }
            ]
          }
        ],
        reviewQuestions: [
          {
            question: 'A simple machine has a velocity ratio of 5. If an effort of 200 N is used to lift a load of 800 N, what is the efficiency of the machine?',
            options: ['75%', '80%', '85%', '90%'],
            correctAnswer: '80%',
            explanation: 'Mechanical Advantage MA = Load / Effort = 800 / 200 = 4. Efficiency η = (MA / VR) × 100% = (4 / 5) × 100% = 80%.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'phy_ch3',
        chapterNumber: 3,
        title: 'Waves, Sound, Optics & Geometric Reflection and Refraction',
        gradeLevel: 'SSS 2',
        estimatedReadTime: '32 mins',
        summary: 'Properties of mechanical and electromagnetic waves, Snell’s Law of refraction, critical angle and total internal reflection, optical instruments (lenses, mirrors, microscopes, telescopes), and Doppler effect.',
        keyConcepts: [
          'Wave Equation: v = f × λ (Speed = Frequency × Wavelength)',
          'Snell’s Law of Refraction: n₁ sin θ₁ = n₂ sin θ₂; Refractive Index n = sin i / sin r = Real Depth / Apparent Depth = Speed in vacuum / Speed in medium',
          'Total Internal Reflection: Occurs when light travels from a denser to a less dense medium at an incident angle greater than the critical angle (sin C = 1/n)',
          'Lens and Mirror Equation: 1/f = 1/u + 1/v (Real-is-positive convention)'
        ],
        formulasOrRules: [
          '1/f = 1/u + 1/v; Magnification m = v / u = Image Height / Object Height',
          'Refractive index n = 1 / sin C'
        ],
        contentSections: [
          {
            heading: '3.1 Geometric Optics & Lens Calculations',
            body: 'Refraction of light through convex (converging) and concave (diverging) spherical lenses forms real and virtual images according to the lens formula.',
            workedExamples: [
              {
                problem: 'An object is placed 15 cm in front of a convex lens of focal length 10 cm. Find the position, nature, and magnification of the image formed.',
                stepByStepSolution: [
                  'Step 1: Identify parameters: u = +15 cm, f = +10 cm.',
                  'Step 2: Apply lens formula: 1/f = 1/u + 1/v → 1/10 = 1/15 + 1/v.',
                  'Step 3: Rearrange for 1/v: 1/v = 1/10 - 1/15 = (3 - 2)/30 = 1/30 → v = +30 cm.',
                  'Step 4: Magnification m = v / u = 30 / 15 = 2.0.'
                ],
                answer: 'Image is formed 30 cm behind the lens; it is real, inverted, and magnified 2×.'
              }
            ]
          }
        ],
        reviewQuestions: [
          {
            question: 'The critical angle for a glass prism immersed in air is 42°. What is the refractive index of the glass? (sin 42° = 0.669)',
            options: ['1.33', '1.49', '1.50', '1.66'],
            correctAnswer: '1.49',
            explanation: 'Refractive index n = 1 / sin C = 1 / sin 42° = 1 / 0.669 ≈ 1.495.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'phy_ch4',
        chapterNumber: 4,
        title: 'Electricity, Electromagnetism, AC Circuits & Modern Atomic Physics',
        gradeLevel: 'SSS 3',
        estimatedReadTime: '35 mins',
        summary: 'Ohm’s Law, Kirchhoff’s circuit rules, magnetic fields around currents, electromagnetic induction (Faraday & Lenz), RLC series alternating current circuits, and photoelectric effect (Einstein’s quantum equation).',
        keyConcepts: [
          'Ohm’s Law: V = I × R; Electrical Power P = V × I = I²R = V² / R',
          'Faraday’s Law of Induction: Induced EMF is directly proportional to rate of change of magnetic flux linkage (E = -N × ΔΦ/Δt)',
          'Transformer Equation: Vp / Vs = Np / Ns = Is / Ip (for 100% ideal efficiency)',
          'RLC Series Circuit Impedance: Z = √[R² + (XL - XC)²] where XL = 2πfL and XC = 1/(2πfC)',
          'Photoelectric Effect: hf = W₀ + KE_max = hf₀ + ½mv²_max'
        ],
        formulasOrRules: [
          'Z = √[R² + (2πfL - 1/(2πfC))²]',
          'Resonant frequency: f₀ = 1 / (2π√(LC))',
          'Einstein’s Photoelectric Equation: E = hf = W₀ + Ek'
        ],
        contentSections: [
          {
            heading: '4.1 Quantum Physics & Photoelectric Emission',
            body: 'When light of frequency higher than the threshold frequency (f₀) strikes a clean metal surface, photoelectrons are ejected instantaneously. Albert Einstein explained this by proposing that light energy is quantized into discrete packets called photons (E = hf).',
            workedExamples: [
              {
                problem: 'A metal has a work function of 3.2 × 10⁻¹⁹ J. If electromagnetic radiation of frequency 8.0 × 10¹⁴ Hz shines on it, calculate the maximum kinetic energy of ejected photoelectrons. (Planck constant h = 6.63 × 10⁻³⁴ J·s).',
                stepByStepSolution: [
                  'Step 1: Calculate energy of incident photon: E = h × f = (6.63 × 10⁻³⁴) × (8.0 × 10¹⁴) = 5.304 × 10⁻¹⁹ J.',
                  'Step 2: Apply Einstein’s equation: KE_max = E - W₀.',
                  'Step 3: KE_max = (5.304 × 10⁻¹⁹ J) - (3.200 × 10⁻¹⁹ J) = 2.104 × 10⁻¹⁹ J.'
                ],
                answer: '2.10 × 10⁻¹⁹ J.'
              }
            ]
          }
        ],
        reviewQuestions: [
          {
            question: 'An ideal step-down transformer has 2000 turns on its primary coil and 100 turns on its secondary coil. If the primary voltage is 240 V, what is the output secondary voltage?',
            options: ['12 V', '24 V', '48 V', '120 V'],
            correctAnswer: '12 V',
            explanation: 'Vs = Vp × (Ns / Np) = 240 V × (100 / 2000) = 240 × 0.05 = 12 V.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      }
    ]
  },

  // 4. GENERAL MATHEMATICS (JSS 1 - SSS 3)
  {
    id: 'tb_general_mathematics',
    title: 'Complete General Mathematics for Junior & Senior Secondary Schools',
    author: 'Mathematical Sciences Curriculum Bureau (NERDC Standards)',
    edition: 'All-in-One Comprehensive 6-Year Edition (JSS 1, JSS 2, JSS 3, SSS 1, SSS 2, SSS 3)',
    subject: 'General Mathematics',
    curriculum: 'NERDC / BECE / WAEC / NECO / JAMB',
    coverColor: 'from-amber-950 via-orange-950 to-slate-950',
    accentColor: 'amber',
    gradeLevels: ['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'],
    description: 'The definitive complete mathematics textbook series encompassing all syllabus requirements from Junior Secondary 1 through Senior Secondary 3. Contains number theory, algebra, Euclidean geometry, trigonometry, statistics, probability, coordinate geometry, matrices, and introductory calculus with thousands of step-by-step solutions.',
    isbn: '978-978-430-109-7',
    totalChapters: 6,
    chapters: [
      {
        id: 'math_jss1',
        chapterNumber: 1,
        title: 'JSS 1: Number Systems, Fractions, Basic Algebra & Geometry Foundations',
        gradeLevel: 'JSS 1',
        estimatedReadTime: '25 mins',
        summary: 'Whole numbers, prime factors, LCM & HCF, fractions, decimals, percentages, directed numbers (+/-), simple linear equations, angles, perimeter and area of plane shapes.',
        keyConcepts: [
          'LCM & HCF using Prime Factorization index notation (e.g. 24 = 2³ × 3; 36 = 2² × 3²)',
          'Operations with Fractions: Addition, Subtraction, Multiplication, Division (BODMAS rule)',
          'Directed Numbers: Rules for addition, subtraction, multiplication and division with negative integers',
          'Linear Algebraic Equations in one variable (e.g. 3x + 7 = 22)',
          'Properties of Angles: Adjacent on a straight line (= 180°), Vertically opposite angles (= equal), Angles at a point (= 360°)'
        ],
        formulasOrRules: [
          'BODMAS: Brackets, Of, Division, Multiplication, Addition, Subtraction',
          'Area of Rectangle = Length × Breadth; Area of Triangle = ½ × Base × Height',
          'Perimeter of Circle (Circumference) = 2πr; Area = πr²'
        ],
        contentSections: [
          {
            heading: '1.1 Prime Factor Decomposition and HCF / LCM',
            body: 'Every integer greater than 1 can be uniquely expressed as a product of prime numbers. To find the HCF, take the lowest powers of common prime factors. To find the LCM, take the highest powers of all prime factors present.',
            workedExamples: [
              {
                problem: 'Find the Highest Common Factor (HCF) and Lowest Common Multiple (LCM) of 72 and 108.',
                stepByStepSolution: [
                  'Step 1: Express in prime factors: 72 = 2³ × 3²; 108 = 2² × 3³.',
                  'Step 2: HCF = lowest powers of common factors = 2² × 3² = 4 × 9 = 36.',
                  'Step 3: LCM = highest powers of all factors = 2³ × 3³ = 8 × 27 = 216.'
                ],
                answer: 'HCF = 36; LCM = 216.'
              }
            ]
          }
        ],
        reviewQuestions: [
          {
            question: 'Solve for x in the equation: 5(x - 3) = 2x + 9.',
            options: ['x = 4', 'x = 6', 'x = 8', 'x = 10'],
            correctAnswer: 'x = 8',
            explanation: 'Expand: 5x - 15 = 2x + 9 → 5x - 2x = 9 + 15 → 3x = 24 → x = 8.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'math_jss2',
        chapterNumber: 2,
        title: 'JSS 2: Proportions, Algebraic Expansions, Inequalities & Pythagoras Theorem',
        gradeLevel: 'JSS 2',
        estimatedReadTime: '26 mins',
        summary: 'Direct and inverse proportions, expansion of algebraic binomials, factorization, linear inequalities in one variable on number lines, Pythagoras’ Theorem, and bearings.',
        keyConcepts: [
          'Direct Proportion (y ∝ x → y = kx) and Inverse Proportion (y ∝ 1/x → y = k/x)',
          'Binomial Expansion: (a + b)² = a² + 2ab + b²; (a - b)² = a² - 2ab + b²; (a + b)(a - b) = a² - b²',
          'Pythagoras’ Theorem: In a right-angled triangle, a² + b² = c² (Hypotenuse² = Opposite² + Adjacent²)',
          'Linear Inequalities: Reversing inequality sign when multiplying or dividing by a negative number'
        ],
        formulasOrRules: [
          'Pythagoras: c = √(a² + b²)',
          'Sum of interior angles of an n-sided polygon = (n - 2) × 180°'
        ],
        contentSections: [
          {
            heading: '2.1 Pythagoras’ Theorem and Applications',
            body: 'For any right-angled triangle with legs a and b and hypotenuse c: a² + b² = c². Common Pythagorean triples include (3, 4, 5), (5, 12, 13), (7, 24, 25), and (8, 15, 17).',
            workedExamples: [
              {
                problem: 'A ladder 13 m long leans against a vertical wall. The foot of the ladder is 5 m from the base of the wall. How high up the wall does the ladder reach?',
                stepByStepSolution: [
                  'Step 1: Apply Pythagoras: Height² + 5² = 13².',
                  'Step 2: Height² + 25 = 169 → Height² = 169 - 25 = 144.',
                  'Step 3: Height = √144 = 12 m.'
                ],
                answer: '12 meters.'
              }
            ]
          }
        ],
        reviewQuestions: [
          {
            question: 'What is the sum of interior angles of a regular hexagon (6-sided polygon)?',
            options: ['540°', '720°', '900°', '1080°'],
            correctAnswer: '720°',
            explanation: 'Sum = (n - 2) × 180° = (6 - 2) × 180° = 4 × 180° = 720°.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'math_jss3',
        chapterNumber: 3,
        title: 'JSS 3: Simultaneous Equations, Quadratic Factorization, Trigonometry & Statistics',
        gradeLevel: 'JSS 3',
        estimatedReadTime: '28 mins',
        summary: 'Simultaneous linear equations (substitution & elimination methods), quadratic equation factorization, basic trigonometric ratios (SOH CAH TOA), angles of elevation & depression, mean, median, mode, and BECE examination prep.',
        keyConcepts: [
          'Simultaneous Equations: Elimination and Substitution algebraic workflows',
          'Quadratic Factorization: Splitting the middle term (ax² + bx + c)',
          'Trigonometric Ratios in right-angled triangles: sin θ = Opp/Hyp, cos θ = Adj/Hyp, tan θ = Opp/Adj',
          'Statistics: Mean (Σx / n), Median (middle value of ordered data), Mode (most frequent value)'
        ],
        formulasOrRules: [
          'SOH CAH TOA',
          'Mean x̄ = (Σfx) / Σf'
        ],
        contentSections: [
          {
            heading: '3.1 Solving Simultaneous Equations (Elimination & Substitution)',
            body: 'Simultaneous equations represent two distinct linear relationships that hold true simultaneously for variables x and y.',
            workedExamples: [
              {
                problem: 'Solve simultaneously: (1) 2x + y = 11, and (2) 3x - y = 9.',
                stepByStepSolution: [
                  'Step 1: Add equation (1) and equation (2): (2x + 3x) + (y - y) = 11 + 9.',
                  'Step 2: 5x = 20 → x = 4.',
                  'Step 3: Substitute x = 4 into equation (1): 2(4) + y = 11 → 8 + y = 11 → y = 3.'
                ],
                answer: 'x = 4, y = 3.'
              }
            ]
          }
        ],
        reviewQuestions: [
          {
            question: 'If tan θ = 3/4 in a right triangle, what is the value of sin θ?',
            options: ['3/5', '4/5', '5/3', '4/3'],
            correctAnswer: '3/5',
            explanation: 'Opposite = 3, Adjacent = 4. Hypotenuse = √(3² + 4²) = 5. Therefore sin θ = Opposite/Hypotenuse = 3/5.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'math_sss1',
        chapterNumber: 4,
        title: 'SSS 1: Number Bases, Modular Arithmetic, Indices, Logarithms & Quadratic Formula',
        gradeLevel: 'SSS 1',
        estimatedReadTime: '30 mins',
        summary: 'Conversion between Number Bases (Base 2, 8, 10, 16), Modular arithmetic clock systems, Laws of Indices and Logarithms, Quadratic equations via Completing the Square and the Quadratic Formula, and Venn diagram set theory.',
        keyConcepts: [
          'Number Base conversions (Base n to Base 10 via expansion; Base 10 to Base n via repeated division)',
          'Laws of Indices: xᵃ × xᵇ = xᵃ⁺ᵇ; xᵃ / xᵇ = xᵃ⁻ᵇ; (xᵃ)ᵇ = xᵃᵇ; x⁰ = 1; x⁻ᵃ = 1/xᵃ; x^(1/n) = ⁿ√x',
          'Laws of Logarithms: log(xy) = log x + log y; log(x/y) = log x - log y; log(xᵏ) = k log x; logₐ a = 1',
          'Quadratic Formula (Almighty Formula): x = [-b ± √(b² - 4ac)] / (2a)'
        ],
        formulasOrRules: [
          'Quadratic Formula: x = (-b ± √(b² - 4ac)) / (2a)',
          'Discriminant Δ = b² - 4ac (Δ > 0: two real roots; Δ = 0: equal roots; Δ < 0: complex roots)'
        ],
        contentSections: [
          {
            heading: '4.1 Derivation and Application of the Quadratic Formula',
            body: 'Given ax² + bx + c = 0 (a ≠ 0), completing the square yields the universal quadratic formula.',
            workedExamples: [
              {
                problem: 'Solve 2x² - 7x + 3 = 0 using the quadratic formula.',
                stepByStepSolution: [
                  'Step 1: Identify coefficients: a = 2, b = -7, c = 3.',
                  'Step 2: Compute discriminant: b² - 4ac = (-7)² - 4(2)(3) = 49 - 24 = 25.',
                  'Step 3: Apply formula: x = [ -(-7) ± √25 ] / (2 × 2) = [ 7 ± 5 ] / 4.',
                  'Step 4: Branch 1: x = (7 + 5)/4 = 12/4 = 3; Branch 2: x = (7 - 5)/4 = 2/4 = 0.5.'
                ],
                answer: 'x = 3 or x = 0.5.'
              }
            ]
          }
        ],
        reviewQuestions: [
          {
            question: 'Evaluate log₁₀(25) + log₁₀(40).',
            options: ['2', '3', '4', '1000'],
            correctAnswer: '3',
            explanation: 'log₁₀(25) + log₁₀(40) = log₁₀(25 × 40) = log₁₀(1000) = 3 (since 10³ = 1000).',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'math_sss2',
        chapterNumber: 5,
        title: 'SSS 2: Circle Theorems, Trigonometric Graphs, Vectors & Probability',
        gradeLevel: 'SSS 2',
        estimatedReadTime: '32 mins',
        summary: 'The 7 Circle Theorems, Sine Rule and Cosine Rule for non-right angled triangles, Graphs of Trigonometric functions, 2D Vectors & Modulus, Theoretical & Experimental Probability, and Binomial distributions.',
        keyConcepts: [
          'Circle Theorems: (1) Angle at center is twice angle at circumference; (2) Angle in semicircle is 90°; (3) Angles in same segment are equal; (4) Opposite angles of cyclic quadrilateral sum to 180°; (5) Tangent is perpendicular to radius; (6) Tangents from external point are equal; (7) Alternate segment theorem',
          'Sine Rule: a / sin A = b / sin B = c / sin C',
          'Cosine Rule: a² = b² + c² - 2bc cos A; cos A = (b² + c² - a²) / (2bc)',
          'Probability: P(A ∪ B) = P(A) + P(B) - P(A ∩ B); Independent events: P(A ∩ B) = P(A) × P(B)'
        ],
        formulasOrRules: [
          'Sine Rule: a/sin A = b/sin B = c/sin C',
          'Cosine Rule: c² = a² + b² - 2ab cos C',
          'Area of Triangle = ½ ab sin C'
        ],
        contentSections: [
          {
            heading: '5.1 Advanced Trigonometry: Sine & Cosine Rules',
            body: 'For any arbitrary scalene triangle ABC with side lengths a, b, and c opposite angles A, B, and C respectively.',
            workedExamples: [
              {
                problem: 'In triangle ABC, side b = 8 cm, side c = 6 cm, and angle A = 60°. Calculate the length of side a. (cos 60° = 0.5).',
                stepByStepSolution: [
                  'Step 1: Apply Cosine Rule: a² = b² + c² - 2bc cos A.',
                  'Step 2: Substitute values: a² = 8² + 6² - 2(8)(6)(cos 60°).',
                  'Step 3: a² = 64 + 36 - 96(0.5) = 100 - 48 = 52.',
                  'Step 4: a = √52 = 2√13 ≈ 7.21 cm.'
                ],
                answer: '7.21 cm.'
              }
            ]
          }
        ],
        reviewQuestions: [
          {
            question: 'In a cyclic quadrilateral ABCD, angle A = 75°. What is the measure of the opposite angle C?',
            options: ['75°', '95°', '105°', '115°'],
            correctAnswer: '105°',
            explanation: 'Opposite angles of a cyclic quadrilateral are supplementary (sum to 180°). Angle C = 180° - 75° = 105°.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'math_sss3',
        chapterNumber: 6,
        title: 'SSS 3: Matrices & Determinants, Coordinate Geometry, Calculus & Statistics',
        gradeLevel: 'SSS 3',
        estimatedReadTime: '35 mins',
        summary: '2×2 and 3×3 Matrices, Determinants, Matrix Inverses, Coordinate Geometry (Gradient, Midpoint, Perpendicular lines), Differentiation & Integration (Calculus foundations), Cumulative Frequency Curves (Ogive), Standard Deviation, and WAEC Master Exam review.',
        keyConcepts: [
          'Coordinate Geometry: Distance d = √[(x₂ - x₁)² + (y₂ - y₁)²]; Gradient m = (y₂ - y₁) / (x₂ - x₁); Equation y - y₁ = m(x - x₁); Perpendicular lines m₁ × m₂ = -1',
          'Matrices: Determinant of 2×2 matrix |A| = ad - bc; Inverse A⁻¹ = (1/|A|) [d, -b; -c, a]',
          'Differentiation: Power Rule d/dx(xⁿ) = n·xⁿ⁻¹; Product Rule, Chain Rule; Maximum/Minimum turning points (dy/dx = 0)',
          'Integration: Indefinite integral ∫ xⁿ dx = (xⁿ⁺¹ / (n+1)) + C; Definite integrals for area under curve',
          'Statistics: Standard Deviation σ = √[ (Σf(x - x̄)²) / Σf ]'
        ],
        formulasOrRules: [
          'd/dx(axⁿ) = a·n·xⁿ⁻¹',
          '∫ axⁿ dx = (a/(n+1)) xⁿ⁺¹ + C (for n ≠ -1)',
          'Ogive quartiles: Q1 = (N/4)th value, Q2 = Median = (N/2)th value, Q3 = (3N/4)th value'
        ],
        contentSections: [
          {
            heading: '6.1 Introduction to Differential and Integral Calculus',
            body: 'Calculus studies rates of change and accumulation of quantities. The derivative dy/dx gives the instantaneous gradient of a tangent line to a curve.',
            workedExamples: [
              {
                problem: 'Find the derivative dy/dx of the function y = 3x⁴ - 5x² + 7x - 9, and evaluate its gradient at x = 2.',
                stepByStepSolution: [
                  'Step 1: Differentiate term by term using power rule: dy/dx = 3(4x³) - 5(2x) + 7(1) - 0 = 12x³ - 10x + 7.',
                  'Step 2: Evaluate at x = 2: dy/dx = 12(2³) - 10(2) + 7 = 12(8) - 20 + 7.',
                  'Step 3: dy/dx = 96 - 20 + 7 = 83.'
                ],
                answer: 'Gradient is 83 at x = 2.'
              }
            ]
          }
        ],
        reviewQuestions: [
          {
            question: 'What is the integral of (4x³ + 6x) with respect to x?',
            options: ['12x² + 6 + C', 'x⁴ + 3x² + C', '4x⁴ + 6x² + C', 'x⁴ + 6x² + C'],
            correctAnswer: 'x⁴ + 3x² + C',
            explanation: '∫ (4x³ + 6x) dx = 4(x⁴/4) + 6(x²/2) + C = x⁴ + 3x² + C.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      }
    ]
  },

  // 5. COMPLETE ENGLISH TEXTBOOK (JSS 1 - SSS 3)
  {
    id: 'tb_complete_english',
    title: 'Complete English Language for Junior & Senior Secondary Schools',
    author: 'Prof. Ayo Banjo, Ph.D. & West African English Language Panel',
    edition: 'Comprehensive 6-Year Mastery Edition (JSS 1 to SSS 3 / WAEC & NECO Standard)',
    subject: 'English Language',
    curriculum: 'NERDC / BECE / WAEC / NECO / JAMB UTME',
    coverColor: 'from-rose-950 via-pink-950 to-slate-950',
    accentColor: 'rose',
    gradeLevels: ['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'],
    description: 'The complete, comprehensive 6-year English language course covering grammar, morphology, syntax, lexis and structure, continuous writing (narrative, descriptive, expository, argumentative, letter writing, articles, speeches), summary skills, reading comprehension, literature analysis, and Oral English (phonetics, stress, intonation) from Junior Secondary 1 to Senior Secondary 3.',
    isbn: '978-978-220-415-7',
    totalChapters: 6,
    chapters: [
      {
        id: 'eng_jss1',
        chapterNumber: 1,
        title: 'JSS 1: Parts of Speech, Sentence Mechanics, Narrative Writing & Vowel Phonics',
        gradeLevel: 'JSS 1',
        estimatedReadTime: '24 mins',
        summary: 'Nouns (proper, common, abstract, collective), Pronouns, Verbs, Adjectives, Punctuation marks (period, comma, question mark, exclamation, apostrophe), Narrative essay structure, Reading comprehension strategies, and Pure Vowel Sounds (/i:/ vs /ɪ/, /u:/ vs /ʊ/).',
        keyConcepts: [
          'Eight Parts of Speech: Nouns, Pronouns, Verbs, Adjectives, Adverbs, Prepositions, Conjunctions, Interjections',
          'Punctuation Mechanics: Capitalization rules, commas in series, apostrophes in possessives (boy’s vs boys’) and contractions (it’s vs its)',
          'Narrative Essay Structure: Setting the scene, rising action, climax, falling action, resolution',
          'Oral English: Monophthongs (12 pure vowels) and distinguishing short vs long vowels'
        ],
        formulasOrRules: [
          'Sentence Rule: Subject + Verb + Object (SVO)',
          'Possessive Rule: Singular noun + ’s (dog’s bone); Plural ending in s + ’ (dogs’ park); Irregular plural + ’s (children’s toys)'
        ],
        contentSections: [
          {
            heading: '1.1 Nouns & Pronoun Antecedent Agreement',
            body: 'A noun is a naming word for people, places, things, or ideas. Pronouns replace nouns to avoid awkward repetition. Every pronoun must agree in number, gender, and person with its antecedent.',
            keyTakeaway: 'Ensure singular pronouns refer back to singular nouns, and plural pronouns to plural nouns.'
          }
        ],
        reviewQuestions: [
          {
            question: 'Identify the abstract noun in the sentence: "The brave soldiers fought with immense courage and patriotism."',
            options: ['Soldiers', 'Fought', 'Courage', 'Brave'],
            correctAnswer: 'Courage',
            explanation: '"Courage" is an abstract noun denoting a state of mind / quality that cannot be physically touched.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'eng_jss2',
        chapterNumber: 2,
        title: 'JSS 2: Verb Tenses, Active & Passive Voice, Direct/Indirect Speech & Informal Letters',
        gradeLevel: 'JSS 2',
        estimatedReadTime: '26 mins',
        summary: 'Transitive and intransitive verbs, Regular vs irregular verb paradigms, Simple, continuous, and perfect tenses, Active and Passive voice transformations, Direct to Indirect (Reported) speech rules, Informal letter writing conventions, and Diphthongs (/eɪ/, /aɪ/, /ɔɪ/, /aʊ/, /əʊ/).',
        keyConcepts: [
          'Active vs Passive Voice: "The teacher marked the script" (Active) → "The script was marked by the teacher" (Passive)',
          'Direct to Indirect Speech Transformations: Change in tenses (Present Simple → Past Simple; Present Continuous → Past Continuous; Present Perfect → Past Perfect; Past Simple → Past Perfect)',
          'Pronoun & Time Adverb Shifts in Reported Speech: "now" → "then", "today" → "that day", "tomorrow" → "the next day", "here" → "there"',
          'Informal Letter Format: Single address (top right), Date, Salutation ("Dear Emeka,"), Conversational body, Subscription ("Your friend," / "Yours sincerely,"), First name only'
        ],
        formulasOrRules: [
          'Passive Construction: Subject (receiver) + Appropriate Form of "to be" + Past Participle (V3) + [by Agent]'
        ],
        contentSections: [
          {
            heading: '2.1 Transforming Direct Speech into Reported Speech',
            body: 'When converting direct speech into reported speech, if the reporting verb is in the past tense (e.g. "He said..."), backshift the verb tense and adjust pronouns and time expressions accordingly.',
            workedExamples: [
              {
                problem: 'Convert from Direct to Indirect Speech: Mary said, "I am studying my chemistry notes today."',
                stepByStepSolution: [
                  'Step 1: Change reporting verb/clause: Mary said that...',
                  'Step 2: Shift pronoun "I" to "she", and "my" to "her".',
                  'Step 3: Backshift verb "am studying" (Present Continuous) to "was studying" (Past Continuous).',
                  'Step 4: Shift time adverb "today" to "that day".'
                ],
                answer: 'Mary said that she was studying her chemistry notes that day.'
              }
            ]
          }
        ],
        reviewQuestions: [
          {
            question: 'What is the passive form of: "The chef cooked a delicious three-course meal"?',
            options: [
              'A delicious three-course meal is cooked by the chef.',
              'A delicious three-course meal was cooked by the chef.',
              'A delicious three-course meal had been cooked by the chef.',
              'The meal was being cooked by the chef.'
            ],
            correctAnswer: 'A delicious three-course meal was cooked by the chef.',
            explanation: 'The sentence is in Past Simple ("cooked"). Its passive is was/were + past participle ("was cooked").',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'eng_jss3',
        chapterNumber: 3,
        title: 'JSS 3: Clauses & Phrases, Formal Letters, Literature Devices & Consonant Clusters',
        gradeLevel: 'JSS 3',
        estimatedReadTime: '28 mins',
        summary: 'Noun clauses, Adjectival clauses (relative clauses with who, whom, whose, which, that), Adverbial clauses (time, place, reason, manner, condition, concession), Formal Letter writing format, Figures of Speech (Simile, Metaphor, Personification, Hyperbole, Onomatopoeia), and Consonant clusters.',
        keyConcepts: [
          'Clause vs Phrase: A clause contains a subject and a finite verb; a phrase lacks a finite verb',
          'Formal Letter Layout: Two addresses (Writer’s address top right + Receiver’s official designation & address left margin), Date, Salutation ("Dear Sir/Madam,"), Formal Title/Heading (Underlined or All Caps), Formal Body in paragraphs, Subscription ("Yours faithfully,"), Full Name and Signature',
          'Literary Devices: Simile (comparison using like/as), Metaphor (direct equivalence), Personification (giving human traits to non-human objects), Hyperbole (deliberate exaggeration)'
        ],
        formulasOrRules: [
          'Formal Letter Subscription: ALWAYS "Yours faithfully," followed by signature and full official name.'
        ],
        contentSections: [
          {
            heading: '3.1 Clause Analysis and Relative Pronouns',
            body: 'Relative clauses qualify nouns. Use "who" for human subjects, "whom" for human objects, "whose" for possession, and "which/that" for non-human entities.'
          }
        ],
        reviewQuestions: [
          {
            question: 'In the sentence "The boy who won the national science olympiad received a scholarship", what is the grammatical name of "who won the national science olympiad"?',
            options: ['Noun clause', 'Adjectival / Relative clause', 'Adverbial clause of manner', 'Prepositional phrase'],
            correctAnswer: 'Adjectival / Relative clause',
            explanation: 'It is an adjectival (relative) clause modifying the noun "boy".',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'eng_sss1',
        chapterNumber: 4,
        title: 'SSS 1: Concord & Agreement Rules, Idiomatic Lexis, Complex Syntax & Argumentative Essays',
        gradeLevel: 'SSS 1',
        estimatedReadTime: '30 mins',
        summary: 'The 20 Essential Rules of Subject-Verb Concord (Principle of Proximity, Neither/Nor, As well as, Collective nouns, Plural in form but singular in meaning), Idioms and Phrasal Verbs, Complex sentence structures, Argumentative essay writing strategies, and Advanced Reading Comprehension.',
        keyConcepts: [
          'Concord Rule 1 (Basic): Singular subject requires singular verb (The boy runs); Plural subject requires plural verb (The boys run)',
          'Concord Rule 2 (Intervening parenthetical phrases): Expressions like "as well as", "together with", "in conjunction with", "accompanied by" do not affect the grammatical number of the subject. E.g. "The Principal, as well as the teachers, is present."',
          'Concord Rule 3 (Correlatives Either...or / Neither...nor): The verb agrees with the closer subject (Principle of Proximity). E.g. "Neither the captain nor the players were ready."',
          'Concord Rule 4 (Each / Every / Everyone): Always singular. E.g. "Every one of the applicants has been interviewed."',
          'Argumentative Essay Writing: Clear thesis statement, structured arguments with empirical evidence, acknowledging counter-arguments, and persuasive conclusion.'
        ],
        formulasOrRules: [
          'Subject + Parenthetical phrase + Singular Verb (e.g. The teacher together with his students is...)',
          'Neither A nor B + Verb agreeing with B'
        ],
        contentSections: [
          {
            heading: '4.1 The Master Rules of Grammatical Concord',
            body: 'Concord denotes grammatical agreement between words in gender, number, case, or person. Subject-verb concord is the most heavily tested grammatical topic in WAEC, NECO, and JAMB UTME.',
            workedExamples: [
              {
                problem: 'Choose the correct verb: "Ten million naira (is / are) a huge sum of money."',
                stepByStepSolution: [
                  'Step 1: Identify the subject: "Ten million naira".',
                  'Step 2: Apply the concord rule for quantities/sums: A sum of money, distance, or period of time regarded as a single unified entity takes a singular verb.',
                  'Step 3: Select "is".'
                ],
                answer: 'Ten million naira IS a huge sum of money.'
              }
            ]
          }
        ],
        reviewQuestions: [
          {
            question: 'Choose the correct option: "Neither the manager nor the security guards _______ the missing keys."',
            options: ['has found', 'have found', 'is finding', 'was found'],
            correctAnswer: 'have found',
            explanation: 'Under the principle of proximity for "neither...nor", the verb agrees with the nearer subject "security guards" (plural), so "have found" is correct.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'eng_sss2',
        chapterNumber: 5,
        title: 'SSS 2: Advanced Summary Skills, Word Stress, Syllabification, Articles & Speeches',
        gradeLevel: 'SSS 2',
        estimatedReadTime: '32 mins',
        summary: 'Techniques for high-scoring Summary writing in WAEC/NECO (identifying core points, eliminating verbatim copying, grammatical precision, sentence pruning), Syllable structure & Primary Stress placement in 2-, 3-, and 4-syllable words, Speech writing, Article for publication in national dailies, and Modal Auxiliaries.',
        keyConcepts: [
          'Summary Writing Rules: (1) Answers must be written in complete grammatical sentences; (2) Avoid mindless lifting/verbatim copying from the passage; (3) Exclude illustrations, examples, and parenthetical anecdotes; (4) Be concise, direct, and accurate.',
          'Word Stress Rules: 2-syllable nouns/adjectives usually stress the 1st syllable (PRE-sent, EX-port); 2-syllable verbs stress the 2nd syllable (pre-SENT, ex-PORT)',
          'Suffix Stress Rules: Words ending in -tion, -sion, -ic, -ical stress the penultimate (second to last) syllable (e-VO-lu-tion, pho-to-GRA-phic)',
          'Modal Auxiliaries (can, could, may, might, shall, should, will, would, must, ought to) expressing possibility, obligation, permission, and necessity.'
        ],
        formulasOrRules: [
          'Noun vs Verb Stress: RE-cord (Noun) vs re-CORD (Verb); OB-ject (Noun) vs ob-JECT (Verb)',
          '-tion / -sion Suffix: Stress on penultimate syllable (e.g. com-mu-ni-CA-tion)'
        ],
        contentSections: [
          {
            heading: '5.1 Scoring Maximum Marks in WAEC/NECO Summary Writing',
            body: 'WAEC summary tests your ability to extract relevant facts and synthesize them concisely. Always write one concise sentence per requested point, beginning with a clear subject and active verb.',
            keyTakeaway: 'Lifting sentences directly without paraphrasing incurs heavy penalty deductions.'
          }
        ],
        reviewQuestions: [
          {
            question: 'Which syllable carries the primary stress in the word "PHOTOGRAPHY"?',
            options: ['PHO-to-gra-phy (1st)', 'pho-TO-gra-phy (2nd)', 'pho-to-GRA-phy (3rd)', 'pho-to-gra-PHY (4th)'],
            correctAnswer: 'pho-TO-gra-phy (2nd)',
            explanation: 'Words ending in -graphy carry primary stress on the antepenultimate syllable (3rd from end): pho-TO-gra-phy.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      },
      {
        id: 'eng_sss3',
        chapterNumber: 6,
        title: 'SSS 3: Advanced Register Analysis, Report Writing, Literature Elements & Exam Mastery',
        gradeLevel: 'SSS 3',
        estimatedReadTime: '35 mins',
        summary: 'Vocabulary and Register Analysis across Law, Medicine, Agriculture, Finance, Information Technology, Aviation, and Government; Official Commissioned Report writing; Dramatic and poetic devices (soliloquy, dramatic irony, enjambment, rhyme scheme, meter); and WAEC/NECO Examination Strategies & Past Questions Mastery.',
        keyConcepts: [
          'Register in Specialised Fields: Law (plaintiff, defendant, subpoena, affidavit, verdict, bailiff); Medicine (diagnosis, prognosis, anesthetic, biopsy, symptom, intravenous); Agriculture (silage, broadcast, tillage, pesticide, agronomist, gestation)',
          'Official Report Structure: Title (Report on...), Terms of Reference, Methodology/Procedure, Findings, Conclusions, Recommendations, Signature & Date',
          'Literary Genres & Terms: Soliloquy (character speaking thoughts aloud alone on stage), Dramatic Irony (audience knows key facts unknown to characters), Tragedy (hubris / tragic flaw leading to catharsis)'
        ],
        formulasOrRules: [
          'Report Format: Title → Introduction/Terms of Reference → Findings → Conclusion → Recommendations → Sign-off'
        ],
        contentSections: [
          {
            heading: '6.1 Register Mastery & Vocabulary Precision',
            body: 'Register denotes the specialized vocabulary, terminology, and stylistic conventions characteristic of a particular profession, discipline, or field of human endeavor.'
          }
        ],
        reviewQuestions: [
          {
            question: 'In the legal register, a formal written statement confirmed by oath or affirmation for use as evidence in court is termed an:',
            options: ['Injunction', 'Affidavit', 'Indictment', 'Subpoena'],
            correctAnswer: 'Affidavit',
            explanation: 'An affidavit is a sworn written testimony signed before an authorized legal commissioner for oaths.',
            type: 'MULTIPLE_CHOICE'
          }
        ]
      }
    ]
  }
];
