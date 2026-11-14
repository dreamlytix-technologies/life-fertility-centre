/**
 * Treatment pages. Copy is written fresh for this site, in plain language, and
 * deliberately makes no promise of outcome: no success rates, guarantees or
 * "best" claims (NMC professional conduct rules). Every service here appears in
 * Dr. Roy's public listings; IUI is common practice but must be confirmed.
 */
export type TreatmentCategory = 'Fertility' | 'Gynaecology' | 'Pregnancy';

export interface Treatment {
  slug: string;
  title: string;
  /** Short label for chips and the bento grid. */
  short: string;
  category: TreatmentCategory;
  icon: 'seed' | 'cell' | 'flask' | 'snow' | 'helix' | 'cycle' | 'leaf' | 'scope' | 'drop' | 'shield' | 'bump' | 'cradle' | 'heart';
  summary: string;
  overview: string[];
  whoFor: string[];
  expect: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  /** Statutory notices to show on the page. */
  notices?: ('ART' | 'PCPNDT')[];
  /** Visit reason preselected when booking from this page. */
  visitReason: 'GYNAE' | 'FERTILITY' | 'PREGNANCY';
  /** true = mentioned for completeness, confirm with the doctor before launch. */
  needsConfirmation?: boolean;
}

export const TREATMENTS: Treatment[] = [
  {
    slug: 'infertility-evaluation',
    title: 'Infertility evaluation & treatment',
    short: 'Infertility care',
    category: 'Fertility',
    icon: 'seed',
    summary: 'A structured look at both partners’ health to understand why pregnancy has not happened yet, and what the options are.',
    overview: [
      'When a couple has been trying to conceive for a year (or six months if the woman is over 35) without a pregnancy, a fertility evaluation can help find the reason. Both partners are assessed, because factors in either can contribute.',
      'The evaluation usually brings together your history, an examination, an ultrasound scan, hormone tests and a semen analysis. Dr. Roy then explains the findings and talks through the treatment options that fit your situation, from simple measures to assisted reproduction.',
    ],
    whoFor: [
      'Couples who have not conceived after 12 months of trying (6 months if over 35)',
      'Women with irregular or absent periods',
      'Anyone with a history of pelvic infection, endometriosis or surgery',
      'Couples who have had more than one miscarriage',
    ],
    expect: [
      { title: 'First consultation', body: 'A private conversation about your history, cycles and any previous tests. Bring earlier reports if you have them.' },
      { title: 'Tests for both partners', body: 'Typically a pelvic ultrasound, blood tests for hormones and a semen analysis. Some tests are timed to the menstrual cycle.' },
      { title: 'Review of results', body: 'The findings are explained in plain words, with time for questions.' },
      { title: 'A treatment plan', body: 'Options are discussed openly, including cost, time and what each step involves, so you can decide together.' },
    ],
    faqs: [
      { q: 'Do both partners need to come?', a: 'It helps if both can attend the first visit, as tests for both partners are usually advised. If that is not possible, one partner can start and the other can follow.' },
      { q: 'Will I need IVF?', a: 'Not necessarily. Many couples are helped by simpler treatment such as ovulation support. The right option depends on the cause, which the evaluation looks for.' },
      { q: 'What should I bring?', a: 'Previous prescriptions, test reports, ultrasound reports and a note of your recent period dates.' },
    ],
    notices: ['ART'],
    visitReason: 'FERTILITY',
  },
  {
    slug: 'ivf-icsi',
    title: 'IVF & ICSI',
    short: 'IVF / ICSI',
    category: 'Fertility',
    icon: 'cell',
    summary: 'In vitro fertilisation, with ICSI where needed, including blastocyst culture, explained step by step.',
    overview: [
      'In IVF, eggs are collected from the ovaries after a course of hormone injections and fertilised with sperm in the laboratory. The resulting embryos are grown for a few days and one is placed in the uterus. ICSI (intracytoplasmic sperm injection) is a technique in which a single sperm is injected into each egg; it is often used when sperm count or movement is low.',
      'Embryos may be grown to the blastocyst stage (day 5 or 6) before transfer. Dr. Roy will explain which approach is suitable for you, what each stage involves and the realistic chances in your circumstances, which depend on age and the cause of infertility.',
    ],
    whoFor: [
      'Blocked or damaged fallopian tubes',
      'Low sperm count or movement (ICSI)',
      'Unexplained infertility after other treatment',
      'Endometriosis, or reduced ovarian reserve',
    ],
    expect: [
      { title: 'Planning', body: 'Baseline scan and blood tests, a written plan for your cycle and a clear breakdown of costs.' },
      { title: 'Stimulation & monitoring', body: 'About 10–12 days of injections, with scans to follow the growth of the follicles.' },
      { title: 'Egg collection & fertilisation', body: 'A short procedure under anaesthesia to collect eggs, followed by IVF or ICSI in the laboratory.' },
      { title: 'Embryo transfer & follow-up', body: 'One embryo is placed in the uterus. A pregnancy test follows about two weeks later.' },
    ],
    faqs: [
      { q: 'Is IVF painful?', a: 'The injections cause mild discomfort for most people. Egg collection is done under anaesthesia, and embryo transfer usually feels similar to a smear test.' },
      { q: 'How many embryos are transferred?', a: 'The number is decided with you, based on your age and embryo quality. Transferring more than one raises the chance of twins or triplets, which carries extra risks for mother and babies, and the ART (Regulation) Act sets an upper limit.' },
      { q: 'Can the centre tell me my chances?', a: 'Dr. Roy will discuss what is realistic for you based on your age and test results. No clinic can guarantee a pregnancy.' },
    ],
    notices: ['ART', 'PCPNDT'],
    visitReason: 'FERTILITY',
  },
  {
    slug: 'iui',
    title: 'Intrauterine insemination (IUI)',
    short: 'IUI',
    category: 'Fertility',
    icon: 'drop',
    summary: 'A simple procedure that places prepared sperm in the uterus around the time of ovulation.',
    overview: [
      'In IUI, a semen sample is washed and concentrated in the laboratory and then placed directly into the uterus through a thin, soft catheter, timed to ovulation. It is often combined with medicine to support ovulation.',
      'IUI is less invasive than IVF and is sometimes tried first, depending on the cause of infertility, the woman’s age and whether the tubes are open.',
    ],
    whoFor: [
      'Mild problems with sperm count or movement',
      'Irregular ovulation, together with ovulation medicine',
      'Unexplained infertility with open tubes',
      'Difficulty with intercourse',
    ],
    expect: [
      { title: 'Cycle tracking', body: 'Scans follow the growing follicle, sometimes with tablets or injections to support ovulation.' },
      { title: 'Trigger & timing', body: 'An injection may be given to time ovulation, and the IUI is planned for about a day later.' },
      { title: 'The procedure', body: 'It takes a few minutes, needs no anaesthesia and you can go home soon after.' },
      { title: 'Pregnancy test', body: 'A test about two weeks later. If it is negative, the next step is discussed together.' },
    ],
    faqs: [
      { q: 'Does IUI hurt?', a: 'Most people feel only mild cramping, similar to a smear test.' },
      { q: 'How many cycles are usually tried?', a: 'This varies. Dr. Roy will discuss when it makes sense to continue and when another option may be better.' },
      { q: 'Do my tubes need to be open?', a: 'Yes. At least one open fallopian tube is needed, so tubal testing is usually done first.' },
    ],
    notices: ['ART'],
    visitReason: 'FERTILITY',
    needsConfirmation: true,
  },
  {
    slug: 'fertility-preservation',
    title: 'Egg, sperm & embryo freezing',
    short: 'Freezing (cryopreservation)',
    category: 'Fertility',
    icon: 'snow',
    summary: 'Cryopreservation of eggs, sperm or embryos, to store them for future use.',
    overview: [
      'Eggs, sperm and embryos can be frozen and stored at very low temperatures for later use. Embryos left over after an IVF cycle can be frozen for a future transfer, which avoids repeating the whole stimulation.',
      'Freezing may also be considered before medical treatment that can affect fertility, such as chemotherapy. Storage, consent and disposal are governed by the ART (Regulation) Act, 2021, and these are explained before anything is stored.',
    ],
    whoFor: [
      'Couples with good-quality embryos left after IVF',
      'Men and women facing treatment that may affect fertility',
      'Men who cannot be present on the day of egg collection',
      'Anyone wanting to discuss their options in detail',
    ],
    expect: [
      { title: 'Counselling', body: 'What can be frozen, how long it can be stored, the costs and the written consent required by law.' },
      { title: 'Collection', body: 'A semen sample, an egg collection after stimulation, or embryos from an IVF cycle.' },
      { title: 'Freezing & storage', body: 'Samples are frozen in the laboratory and stored with records kept as the ART Act requires.' },
      { title: 'Future use', body: 'When you are ready, samples are thawed for treatment. Consent can be reviewed at any time.' },
    ],
    faqs: [
      { q: 'How long can samples be stored?', a: 'Storage periods are set by the ART (Regulation) Act and the consent you sign. Dr. Roy will explain the current rules.' },
      { q: 'Do all frozen samples survive thawing?', a: 'Not always. Survival depends on the type and quality of the sample. This is discussed before freezing.' },
      { q: 'Is there a yearly charge?', a: 'Storage is usually charged separately. Ask for the current fees at your consultation.' },
    ],
    notices: ['ART'],
    visitReason: 'FERTILITY',
  },
  {
    slug: 'pgt',
    title: 'Preimplantation genetic testing (PGT)',
    short: 'PGT / PGD',
    category: 'Fertility',
    icon: 'helix',
    summary: 'Testing embryos for specific genetic conditions before transfer, as part of IVF, where it is medically indicated.',
    overview: [
      'Preimplantation genetic testing (PGT, earlier called PGD) checks a few cells from an embryo created by IVF for a specific genetic or chromosomal condition, so that an unaffected embryo can be chosen for transfer.',
      'PGT is used only for medical reasons, such as a known inherited condition in the family. By law, it is never used to select the sex of an embryo.',
    ],
    whoFor: [
      'Couples who carry a known inherited genetic condition',
      'A chromosomal rearrangement in either partner',
      'Repeated miscarriage, after other causes have been checked',
      'Couples advised to consider it by a genetic specialist',
    ],
    expect: [
      { title: 'Genetic counselling', body: 'Whether PGT is suitable, what it can and cannot detect, and the limits of the test.' },
      { title: 'IVF cycle', body: 'Embryos are created by IVF and grown to the blastocyst stage.' },
      { title: 'Biopsy & testing', body: 'A few cells are taken from each embryo and sent to an accredited genetics laboratory; the embryos are frozen meanwhile.' },
      { title: 'Results & transfer', body: 'An unaffected embryo is chosen for a later frozen transfer.' },
    ],
    faqs: [
      { q: 'Can PGT be used to choose a boy or a girl?', a: 'No. Sex selection is illegal under the PCPNDT Act, 1994, and is never done at this centre.' },
      { q: 'Does PGT guarantee a healthy baby?', a: 'No test is perfect. PGT reduces the chance of the specific condition tested for; routine pregnancy screening is still advised.' },
      { q: 'Is PGT done on site?', a: 'The embryo biopsy is part of the IVF process; the genetic analysis is done by a specialised laboratory. Details are explained at consultation.' },
    ],
    notices: ['ART', 'PCPNDT'],
    visitReason: 'FERTILITY',
  },
  {
    slug: 'pcos-pcod',
    title: 'PCOS / PCOD management',
    short: 'PCOS / PCOD',
    category: 'Gynaecology',
    icon: 'cycle',
    summary: 'Help with irregular periods, weight, acne, excess hair and fertility linked to polycystic ovaries.',
    overview: [
      'Polycystic ovary syndrome (PCOS, often called PCOD) is a common hormonal condition. It can cause irregular or missed periods, acne, extra facial or body hair, weight gain and difficulty getting pregnant. It is also linked to a higher risk of diabetes later in life.',
      'Care is tailored to what matters most to you at the moment: regular cycles, symptom relief or pregnancy. It usually combines lifestyle advice with medicine, and ovulation support when you are trying to conceive.',
    ],
    whoFor: [
      'Irregular, infrequent or absent periods',
      'Acne or extra hair growth',
      'Weight gain that is hard to manage',
      'Difficulty conceiving because of irregular ovulation',
    ],
    expect: [
      { title: 'Assessment', body: 'History, examination, a pelvic ultrasound and blood tests for hormones, sugar and thyroid.' },
      { title: 'Diagnosis explained', body: 'What PCOS is, what it is not, and what it means for your health and fertility.' },
      { title: 'Personal plan', body: 'Lifestyle steps, medicine for cycles or symptoms, and ovulation support if you are planning a pregnancy.' },
      { title: 'Follow-up', body: 'Regular reviews to see how you are doing and adjust the plan.' },
    ],
    faqs: [
      { q: 'Can I get pregnant with PCOS?', a: 'Many women with PCOS conceive, sometimes with help to ovulate. Dr. Roy will discuss options suited to you.' },
      { q: 'Is PCOS curable?', a: 'It is a long-term condition, but symptoms can usually be managed well with the right care.' },
      { q: 'Do cysts need surgery?', a: 'Usually not. The “cysts” in PCOS are small follicles and rarely need an operation.' },
    ],
    visitReason: 'GYNAE',
  },
  {
    slug: 'fibroids',
    title: 'Fibroid treatment',
    short: 'Fibroids',
    category: 'Gynaecology',
    icon: 'leaf',
    summary: 'Assessment and treatment of uterine fibroids, from watchful waiting and medicine to keyhole surgery.',
    overview: [
      'Fibroids are non-cancerous growths of the muscle of the uterus. Many cause no symptoms. Others lead to heavy or painful periods, pressure on the bladder, or problems with fertility, depending on their size and position.',
      'Treatment depends on your symptoms, the fibroids’ size and location, and whether you want to become pregnant. Options range from monitoring and medicine to removal of the fibroids, often by laparoscopic (keyhole) or hysteroscopic surgery.',
    ],
    whoFor: [
      'Heavy or prolonged periods',
      'Pelvic pain or pressure, or frequent urination',
      'Fibroids found on a scan',
      'Fibroids that may affect fertility',
    ],
    expect: [
      { title: 'Consultation & scan', body: 'A pelvic ultrasound shows the number, size and position of fibroids.' },
      { title: 'Options discussed', body: 'Watchful waiting, medicine or surgery, with the benefits and risks of each.' },
      { title: 'Treatment', body: 'If surgery is chosen, a minimally invasive approach is used where suitable.' },
      { title: 'Recovery & review', body: 'Clear advice for recovery and a follow-up visit.' },
    ],
    faqs: [
      { q: 'Are fibroids cancer?', a: 'Fibroids are almost always benign. Your scan and examination help confirm this.' },
      { q: 'Do all fibroids need treatment?', a: 'No. Small fibroids without symptoms often only need monitoring.' },
      { q: 'Will I need my uterus removed?', a: 'Not usually. Fibroids can often be removed while keeping the uterus. The right option is discussed with you.' },
    ],
    visitReason: 'GYNAE',
  },
  {
    slug: 'laparoscopy-hysteroscopy',
    title: 'Laparoscopic & hysteroscopic surgery',
    short: 'Keyhole gynae surgery',
    category: 'Gynaecology',
    icon: 'scope',
    summary: 'Minimally invasive (endoscopic) gynaecological surgery for diagnosis and treatment.',
    overview: [
      'Laparoscopy uses a thin camera passed through a small cut near the navel to look at and operate on the uterus, tubes and ovaries. Hysteroscopy passes a fine camera through the cervix to look inside the uterus, with no cuts on the abdomen.',
      'These approaches can be used to diagnose and treat problems such as fibroids, polyps, ovarian cysts, endometriosis, blocked tubes and a septum in the uterus. Smaller incisions usually mean less pain and a quicker return to daily life than open surgery.',
    ],
    whoFor: [
      'Ovarian cysts or endometriosis',
      'Fibroids or polyps',
      'Checking or treating the fallopian tubes',
      'Abnormalities inside the uterus',
    ],
    expect: [
      { title: 'Pre-operative visit', body: 'The procedure, its risks and alternatives are explained; tests and anaesthetic assessment are arranged.' },
      { title: 'Day of surgery', body: 'Most procedures are done under anaesthesia; many patients go home the same day or the next.' },
      { title: 'Recovery', body: 'Written advice on pain relief, wound care and when to resume work and exercise.' },
      { title: 'Follow-up', body: 'A review visit to go through what was found and the next steps.' },
    ],
    faqs: [
      { q: 'Where is the surgery done?', a: 'Dr. Roy will tell you where your procedure is scheduled and how to prepare.' },
      { q: 'How big are the cuts?', a: 'Laparoscopy uses a few small cuts, usually 5–10 mm. Hysteroscopy needs no abdominal cuts.' },
      { q: 'Is it safe?', a: 'Every operation carries some risk. These are discussed with you in detail before you decide.' },
    ],
    visitReason: 'GYNAE',
  },
  {
    slug: 'abnormal-uterine-bleeding',
    title: 'Abnormal uterine bleeding',
    short: 'Heavy / irregular periods',
    category: 'Gynaecology',
    icon: 'drop',
    summary: 'Investigation and treatment of heavy, irregular or unexpected bleeding.',
    overview: [
      'Periods that are very heavy, last longer than usual, come too often or at irregular times, or bleeding between periods or after menopause, should be checked. Causes include hormonal changes, fibroids, polyps, thyroid problems and, less commonly, more serious conditions.',
      'Finding the cause allows treatment to be matched to it, from medicine to a minor procedure.',
    ],
    whoFor: [
      'Very heavy periods or passing large clots',
      'Bleeding between periods or after intercourse',
      'Irregular cycles',
      'Any bleeding after menopause',
    ],
    expect: [
      { title: 'History & examination', body: 'Questions about your cycle, and an examination where appropriate.' },
      { title: 'Tests', body: 'Usually an ultrasound and blood tests; sometimes a hysteroscopy or a small sample of the lining.' },
      { title: 'Treatment', body: 'Hormonal or non-hormonal medicine, or a procedure, depending on the cause.' },
      { title: 'Review', body: 'A follow-up to check that the treatment is working for you.' },
    ],
    faqs: [
      { q: 'When is bleeding urgent?', a: 'Very heavy bleeding with dizziness or fainting, or any heavy bleeding in pregnancy, needs urgent care at the nearest hospital.' },
      { q: 'Is bleeding after menopause serious?', a: 'It should always be checked promptly, even if it is light.' },
      { q: 'Will I need surgery?', a: 'Most women are treated with medicine. A procedure is advised only when it is needed.' },
    ],
    visitReason: 'GYNAE',
  },
  {
    slug: 'vaginal-infections',
    title: 'Vaginal discharge & infections',
    short: 'Discharge & infections',
    category: 'Gynaecology',
    icon: 'shield',
    summary: 'Confidential assessment and treatment of discharge, itching, irritation and pelvic infections.',
    overview: [
      'A change in vaginal discharge, itching, burning or odour is common and often due to an infection that is easy to treat. Some infections can affect fertility or pregnancy if left untreated.',
      'A short, private consultation, sometimes with a simple swab test, finds the cause so that the right treatment is given.',
    ],
    whoFor: [
      'Unusual discharge, itching or odour',
      'Burning when passing urine',
      'Pain during intercourse',
      'Recurring infections',
    ],
    expect: [
      { title: 'Private consultation', body: 'A confidential talk about your symptoms.' },
      { title: 'Examination & tests', body: 'An examination and, if needed, a swab or urine test.' },
      { title: 'Treatment', body: 'Medicine matched to the cause, with advice to prevent recurrence.' },
      { title: 'Partner advice', body: 'When an infection can pass between partners, treatment for both is explained.' },
    ],
    faqs: [
      { q: 'Is every discharge an infection?', a: 'No. Some discharge is normal and changes during the cycle. A check helps tell the difference.' },
      { q: 'Is it treated in pregnancy?', a: 'Yes, with medicine that is safe in pregnancy. Please mention if you are pregnant.' },
      { q: 'Is the consultation confidential?', a: 'Yes. Your information is kept private.' },
    ],
    visitReason: 'GYNAE',
  },
  {
    slug: 'pregnancy-care',
    title: 'Antenatal & high-risk pregnancy care',
    short: 'Pregnancy care',
    category: 'Pregnancy',
    icon: 'bump',
    summary: 'Regular check-ups through pregnancy, with closer monitoring when a pregnancy needs extra care.',
    overview: [
      'Antenatal care is a series of check-ups that follow the health of mother and baby through pregnancy: blood pressure, weight, blood and urine tests, scans at the recommended stages, and advice on diet, supplements and warning signs.',
      'Some pregnancies need closer monitoring, for example with high blood pressure, diabetes, thyroid disease, twins, a previous caesarean or complications in an earlier pregnancy, and pregnancies after fertility treatment. Visits and tests are then planned more often.',
    ],
    whoFor: [
      'Anyone who is pregnant or has a positive pregnancy test',
      'Pregnancies after fertility treatment',
      'High blood pressure, diabetes or thyroid conditions',
      'Twins, a previous caesarean or a difficult earlier pregnancy',
    ],
    expect: [
      { title: 'First visit', body: 'Confirming the pregnancy, dating it, a full history and the first set of tests.' },
      { title: 'Regular check-ups', body: 'Visits that become more frequent later in pregnancy, with scans at the recommended times.' },
      { title: 'Planning the birth', body: 'Talking through the options for delivery and preparing for labour.' },
      { title: 'After the birth', body: 'A postnatal check for the mother, and advice on recovery and contraception.' },
    ],
    faqs: [
      { q: 'When should I book my first visit?', a: 'As soon as you have a positive test, ideally before 10 weeks.' },
      { q: 'Can you tell me if it is a boy or a girl?', a: 'No. Sex determination of the foetus is not done at this centre. It is a punishable offence under the PCPNDT Act, 1994.' },
      { q: 'What if I have bleeding or pain?', a: 'Bleeding, severe pain, leaking fluid or reduced baby movements need urgent attention. Call the centre and, if it is severe, go to the nearest hospital straight away.' },
    ],
    notices: ['PCPNDT'],
    visitReason: 'PREGNANCY',
  },
  {
    slug: 'delivery',
    title: 'Normal & assisted vaginal delivery',
    short: 'Delivery',
    category: 'Pregnancy',
    icon: 'cradle',
    summary: 'Care through labour and birth, including assisted vaginal delivery when it is needed.',
    overview: [
      'Most babies are born by normal vaginal delivery. During labour, the progress of labour and the baby’s wellbeing are monitored closely, with pain relief options discussed in advance.',
      'Sometimes help is needed in the final stage of labour, for example with a vacuum (ventouse) or forceps. This is called assisted vaginal delivery and is used only when it is safer for mother or baby. A caesarean section is advised when it is the safer route.',
    ],
    whoFor: [
      'Women planning their birth with Dr. Roy',
      'Those who want to understand their delivery options',
      'Anyone with questions after a previous difficult birth',
      'Mothers who had a previous caesarean and wish to discuss options',
    ],
    expect: [
      { title: 'Birth planning', body: 'Discussing your wishes, pain relief and what happens if plans need to change.' },
      { title: 'Labour', body: 'Monitoring of mother and baby, with decisions explained as they arise.' },
      { title: 'Birth', body: 'Normal delivery where possible; assisted delivery or caesarean only when advised for safety.' },
      { title: 'Postnatal care', body: 'Checks for mother and baby, help with feeding and a follow-up visit.' },
    ],
    faqs: [
      { q: 'Where will I deliver?', a: 'Dr. Roy will discuss the hospital arrangements for your delivery during your antenatal visits.' },
      { q: 'What is assisted vaginal delivery?', a: 'Help with a vacuum cup or forceps in the final stage of labour, used only when it is safer than waiting.' },
      { q: 'Can I have a normal delivery after a caesarean?', a: 'Sometimes. It depends on the reason for the earlier caesarean and other factors, discussed at your visits.' },
    ],
    notices: ['PCPNDT'],
    visitReason: 'PREGNANCY',
  },
  {
    slug: 'general-gynaecology',
    title: 'General gynaecology',
    short: 'General gynaecology',
    category: 'Gynaecology',
    icon: 'heart',
    summary: 'Everyday women’s health, from period problems and pelvic pain to menopause and contraception advice.',
    overview: [
      'A general gynaecology consultation covers the wide range of questions women have about their health: period problems, pelvic pain, ovarian cysts, ovulatory problems, contraception, menopause symptoms and routine check-ups.',
      'You will have unhurried time to explain what is going on, and a clear explanation of any tests and treatment.',
    ],
    whoFor: [
      'Period pain or irregular cycles',
      'Pelvic pain or ovarian cysts',
      'Contraception and pre-pregnancy advice',
      'Menopause symptoms',
    ],
    expect: [
      { title: 'Consultation', body: 'Time to talk about your concern in private.' },
      { title: 'Examination', body: 'Only when needed, explained beforehand and with your consent.' },
      { title: 'Tests if needed', body: 'Ultrasound or blood tests are arranged when they will help.' },
      { title: 'Plan', body: 'A clear plan with follow-up as required.' },
    ],
    faqs: [
      { q: 'Can I bring someone with me?', a: 'Yes. You are welcome to bring a family member or friend.' },
      { q: 'Do I need a referral?', a: 'No referral is needed. You can book directly online or by phone.' },
      { q: 'Which languages does Dr. Roy speak?', a: 'Bengali, English and Hindi.' },
    ],
    visitReason: 'GYNAE',
  },
];

export const treatmentBySlug = (slug: string) => TREATMENTS.find((t) => t.slug === slug);
export const treatmentsIn = (cat: TreatmentCategory) => TREATMENTS.filter((t) => t.category === cat);
