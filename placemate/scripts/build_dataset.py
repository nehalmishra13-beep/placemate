"""Builds data/research/dataset.json. Edit this file to add research, then re-run:  python3 scripts/build_dataset.py
Rules: question text is our own wording; every non-practice question must have a source we actually read."""
import json
ACC = "2026-11-16"
GFG = "GeeksforGeeks"
def S(sid, url, title, date=None, typ="candidate-report"):
    return dict(id=sid, url=url, title=title, sourceType=typ, sourceDate=date, accessedDate=ACC)

SRC = {s["id"]: s for s in [
 # Amazon
 S("A1","https://www.geeksforgeeks.org/?p=468167","Amazon Interview Experience | On-Campus for SDE-1 (GeeksforGeeks)","2021-11-18"),
 S("A2","https://www.geeksforgeeks.org/amazon-interview-experience-for-sde-1-on-campus-5/","Amazon Interview Experience for SDE-1 (On-Campus) (GeeksforGeeks)","2021-12-17"),
 S("A3","https://www.geeksforgeeks.org/?p=676428","Amazon Interview Experience for SDE 1 | On-Campus (GeeksforGeeks)","2021-09-28"),
 S("A4","https://www.geeksforgeeks.org/?p=335188","Amazon Interview Experience | On-Campus (GeeksforGeeks)","2021-06-30"),
 S("A5","https://www.geeksforgeeks.org/?p=612312","Amazon Interview Experience for SDE-I (On-Campus) (GeeksforGeeks)","2021-08-20"),
 S("A6","https://www.geeksforgeeks.org/?p=729992","Amazon Interview Experience for SDE-I (On-Campus) (GeeksforGeeks)","2021-12-21"),
 # Microsoft
 S("M1","https://www.geeksforgeeks.org/?p=134219","Microsoft interview Experience | Set 49 (For Internship) (GeeksforGeeks)","2019-01-10"),
 S("M2","https://www.geeksforgeeks.org/?p=486909","Microsoft Interview Experience (On-Campus Internship) (GeeksforGeeks)","2021-08-17"),
 S("M3","https://www.geeksforgeeks.org/microsoft-interview-experience-for-sde-i-on-campus/","Microsoft Interview Experience for SDE-I (On-Campus) (GeeksforGeeks)","2021-12-21"),
 S("M4","https://www.geeksforgeeks.org/?p=882294","Microsoft Interview Experience for SDE (On-Campus) 2022 (GeeksforGeeks)","2022-09-20"),
 S("M5","https://www.geeksforgeeks.org/?p=976524","Microsoft Interview Experience for SDE (On-Campus) (GeeksforGeeks)","2023-03-10"),
 S("M6","https://www.geeksforgeeks.org/?p=216244","Microsoft Interview Experience - On campus SDE Intern (GeeksforGeeks)","2018-08-02"),
 S("M7","https://www.geeksforgeeks.org/microsoft-interview-experience-for-sde-1-on-campus/","Microsoft Interview Experience for SDE-1 (On-Campus) (GeeksforGeeks)","2023-01-27"),
 # TCS
 S("T1","https://www.geeksforgeeks.org/?p=946895","TCS Ninja + Digital Interview Experience (GeeksforGeeks)","2023-01-24"),
 S("T2","https://www.geeksforgeeks.org/?p=1032812","TCS Ninja Interview Experience (GeeksforGeeks)","2023-07-10"),
 S("T3","https://www.geeksforgeeks.org/?p=546528","TCS NQT Interview Experience (2020-21) (GeeksforGeeks)","2022-01-10"),
 S("T4","https://www.geeksforgeeks.org/?p=890400","TCS Ninja Interview Experience 2022 (GeeksforGeeks)","2022-10-11"),
 S("T5","https://www.geeksforgeeks.org/?p=552181","TCS Ninja Interview Experience (2021 Virtual) (GeeksforGeeks)","2022-01-10"),
 S("T6","https://www.geeksforgeeks.org/?p=993381","TCS Interview Experience (GeeksforGeeks)","2023-04-03"),
 S("T7","https://hyring.com/jobseeker-toolkit/interview-questions/company/tcs","TCS Interview Process & Experience (2026) (Hyring, third-party summary)",None,"third-party-prep"),
 # Infosys
 S("I1","https://www.geeksforgeeks.org/?p=641612","INFYTQ Interview Experience for System Engineer 2022 (GeeksforGeeks)","2021-07-15"),
 S("I2","https://www.geeksforgeeks.org/?p=1036368","Infosys Interview Experience for System Engineer (GeeksforGeeks)","2023-07-19"),
 S("I3","https://www.geeksforgeeks.org/?p=515284","Infosys Infytq Interview Experience for System Engineer 2020 (GeeksforGeeks)","2020-11-20"),
 S("I4","https://www.geeksforgeeks.org/?p=329795","Infosys Certification Exam | InfyTQ (GeeksforGeeks)",None),
 S("I5","https://static.glassdoor.com.br/Interview/Infosys-System-Engineer-Interview-Questions-EI_IE7927.0,7_KO8,23_IP63.htm","Infosys System Engineer interview reviews (Glassdoor, anonymous)",None),
 S("I6","https://static.glassdoor.nl/Interview/Infosys-Systems-Engineer-Interview-Questions-EI_IE7927.0,7_KO8,24_IP4.htm","Infosys Systems Engineer interview reviews (Glassdoor, anonymous)",None),
]}
def src(*ids): return [{k:v for k,v in SRC[i].items() if k!="id"} for i in ids]

COMPANIES = [
 dict(slug="amazon", name="Amazon",
  overview="Technology and e-commerce company. This page covers campus software-engineering (SDE) hiring as described by candidates on public pages.",
  roles=["SDE-1","SDE Intern"],
  hiringProcess=[
   dict(name="Online assessment", description="Candidates describe an online test with several sections. Reported sections include code debugging, coding problems and, in some accounts, MCQs or a behavioral section. Number of coding questions and sections varies between years and campuses."),
   dict(name="Technical interviews", description="Most accounts report two to four technical rounds (video call or face to face), each with one or two coding problems on a shared code editor, plus questions on your resume. Some accounts also mention DBMS, networks and OS questions."),
   dict(name="Managerial / behavioral discussion", description="Several candidates report a managerial or behavioral part and advise reading Amazon's Leadership Principles before the interview.")],
  hiringSources=src("A1","A2","A3","A4","A5","A6"),
  topics=["Arrays","Linked lists","Binary trees","Graphs / BFS","Binary search","Stacks","Design (LRU cache)","OS basics","Leadership Principles"],
  prepResources=[dict(title="Amazon Jobs: interview preparation",url="https://www.amazon.jobs/en/landing_pages/in-person-interview",note="Linked by a candidate as the source of standard behavioral questions. Not reviewed by us; open it to check the current content.")],
  dataNote="Six candidate accounts (2019 to 2021 campus drives, GeeksforGeeks). No official Amazon source was reviewed for the process, so rounds are candidate-reported and may have changed."),
 dict(slug="microsoft", name="Microsoft",
  overview="Technology company. This page covers campus software-engineering hiring as described by candidates on public pages.",
  roles=["SDE / SWE-1","SDE Intern"],
  hiringProcess=[
   dict(name="Online assessment", description="Candidates report an online coding test with two or three problems (platforms named in accounts include CoCubes and Mettl). One account says speed of solving mattered for shortlisting."),
   dict(name="Technical interviews", description="One to three technical rounds with coding problems, discussion of your approach and questions on your resume and past work."),
   dict(name="Final 'AA' round", description="Two accounts describe a final round with a senior interviewer that mixes behavioral and cultural-fit questions with some technical discussion.")],
  hiringSources=src("M1","M2","M3","M4","M5","M6","M7"),
  topics=["Dynamic programming","Binary trees","Stacks","Strings / expression evaluation","Graphs","Behavioral / teamwork"],
  prepResources=[],
  dataNote="Seven candidate accounts (2018 to 2023, GeeksforGeeks). Few individual questions were stated clearly in the pages we read, so the question count is small on purpose."),
 dict(slug="tcs", name="TCS",
  overview="IT services company. Fresher hiring is commonly through the TCS NQT test. This page uses candidate accounts and one third-party summary.",
  roles=["Ninja","Digital","Prime (mentioned by a third-party summary)"],
  hiringProcess=[
   dict(name="TCS NQT (online test)", description="Candidates describe a proctored online test with aptitude and coding sections. A third-party summary says the official NQT has Foundation and Advanced sections and that scores decide Prime, Digital or Ninja interviews. We have not reviewed the official TCS page, so check it for the current format."),
   dict(name="Technical interview", description="Short (about 15 to 30 minutes) and mostly basics: introduce yourself, projects, programming-language and OOP fundamentals."),
   dict(name="Managerial and HR", description="Ninja interviews are often described as a panel with technical, managerial and HR interviewers. HR questions are personal and situational (family, relocation, goals).")],
  hiringSources=src("T1","T2","T3","T4","T5","T6","T7"),
  topics=["OOP","C / C++ / Java basics","Projects","Aptitude","Basic coding","HR"],
  prepResources=[],
  dataNote="Candidate accounts from 2021 to 2023 plus a third-party summary. The NQT format and tracks change often, so treat all round details as possibly out of date."),
 dict(slug="infosys", name="Infosys",
  overview="IT services company. System Engineer hiring is described through campus drives and the InfyTQ certification route.",
  roles=["System Engineer"],
  hiringProcess=[
   dict(name="Online test", description="Candidates describe an aptitude and programming test (on the InfyTQ platform in several accounts). One account says a minimum of 65 percent was needed for the on-the-spot interview."),
   dict(name="Technical + HR interview", description="Often a single interviewer for about 20 to 30 minutes covering projects, OOP, DBMS/SQL and programming basics, then HR questions on strengths, relocation and shifts. Some accounts split this into separate rounds.")],
  hiringSources=src("I1","I2","I3","I4","I5","I6"),
  topics=["OOP (C++ / Java)","DBMS and normalization","SQL (GROUP BY)","Programming basics","Projects","HR"],
  prepResources=[],
  dataNote="Four GeeksforGeeks accounts and Glassdoor reviews (2020 to 2023). The InfyTQ route and thresholds may have changed."),
]

Q = []
def q(company, title, statement, cat, diff, rnd, status, sids=(), role=None, approach=None, cx=None, code=None, entry=None, notes=None, tags=()):
    Q.append(dict(company=company, title=title, statement=statement, category=cat, difficulty=diff, round=rnd, role=role,
        verificationStatus=status, sources=src(*sids), approach=approach, complexity=cx, solutionCode=code, codeEntry=entry, notes=notes, tags=list(tags)))
CR, PR = "candidate-reported", "practice"

# ---- Amazon (candidate-reported) ----
q("amazon","Merge two sorted linked lists","Given the heads of two linked lists that are each sorted in ascending order, merge them into one sorted list and return its head.","DSA","Easy","Online Assessment",CR,["A1"],"SDE-1",
  "Use two pointers, one per list, and a dummy head node. Repeatedly attach the smaller current node to the tail, then attach whatever remains of the other list.","Time O(n+m), extra space O(1)",tags=["linked-list"])
q("amazon","Two Sum","Given an integer array and a target value, return the indices of two different elements whose values add up to the target.","DSA","Easy","Online Assessment",CR,["A1"],"SDE-1",
  "Keep a hash map from value to index. For each number x, check whether target - x is already in the map; if so you have the pair, otherwise store x.","Time O(n), space O(n)",
  "function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}","twoSum",tags=["array","hash-map"])
q("amazon","Critical connections in a network","A network has n servers numbered 0 to n-1 joined by undirected links. A link is critical if removing it leaves some servers unable to reach each other. Return all critical links.","DSA","Hard","Online Assessment",CR,["A1"],"SDE-1",
  "Run a DFS and record each node's discovery time and the lowest discovery time reachable from its subtree (low-link). A tree edge (u, v) is a bridge when low[v] is greater than disc[u].","Time O(V+E), space O(V+E)",tags=["graph","dfs","bridges"])
q("amazon","Paths in a binary tree that sum to K","Given a binary tree and a number K, print every downward path (starting and ending at any nodes) whose values add up to K.","DSA","Medium","Technical Interview",CR,["A1"],"SDE-1",
  "Do a DFS and keep the current root-to-node path in a list. At each node, walk backwards along the path adding values; every time the running sum equals K, record that segment.","Time O(n * h) where h is the tree height, space O(h)",tags=["binary-tree","dfs"])
q("amazon","Can a number be written as a sum of consecutive numbers?","Decide whether a positive integer n can be written as the sum of two or more consecutive positive integers.","DSA","Medium","Technical Interview",CR,["A1"],"SDE-1",
  "A number can be written this way exactly when it is not a power of two. Divide out all factors of two; if something larger than 1 remains, an odd factor exists and gives a valid run of consecutive numbers.","Time O(log n), space O(1)",
  "function canBeSumOfConsecutive(n) {\n  if (n <= 0) return false;\n  while (n % 2 === 0) n /= 2;\n  return n > 1;\n}","canBeSumOfConsecutive",tags=["math"])
q("amazon","Minimum knight moves to a target square","On an n by n chessboard, find the minimum number of moves a knight needs to get from a start square to a target square.","DSA","Medium","Technical Interview",CR,["A1","A6"],"SDE-1",
  "Treat each square as a graph node and each of the 8 knight moves as an edge, then run BFS from the start. The first time you reach the target gives the minimum number of moves.","Time O(n^2), space O(n^2)",
  "function knightMinSteps(n, [sr, sc], [tr, tc]) {\n  const mv = [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];\n  const dist = Array.from({ length: n }, () => Array(n).fill(-1));\n  dist[sr][sc] = 0;\n  const q = [[sr, sc]];\n  for (let h = 0; h < q.length; h++) {\n    const [r, c] = q[h];\n    if (r === tr && c === tc) return dist[r][c];\n    for (const [dr, dc] of mv) {\n      const nr = r + dr, nc = c + dc;\n      if (nr >= 0 && nc >= 0 && nr < n && nc < n && dist[nr][nc] < 0) {\n        dist[nr][nc] = dist[r][c] + 1;\n        q.push([nr, nc]);\n      }\n    }\n  }\n  return -1;\n}","knightMinSteps",
  notes="Reported in two separate accounts.",tags=["graph","bfs"])
q("amazon","Rotate a square matrix by 90 degrees","Rotate an n by n matrix 90 degrees clockwise, in place if possible.","DSA","Medium","Online Assessment",CR,["A2"],"SDE-1",
  "Transpose the matrix (swap m[i][j] with m[j][i]), then reverse every row. This gives a clockwise rotation without extra space.","Time O(n^2), space O(1)",
  "function rotateMatrix(m) {\n  const n = m.length;\n  for (let i = 0; i < n; i++)\n    for (let j = i + 1; j < n; j++) [m[i][j], m[j][i]] = [m[j][i], m[i][j]];\n  for (const row of m) row.reverse();\n  return m;\n}","rotateMatrix",tags=["matrix"])
q("amazon","Next greater element","For every element of an array, find the first larger element to its right. Use -1 when there is none.","DSA","Medium","Technical Interview",CR,["A2"],"SDE-1",
  "Scan left to right with a stack of indices whose answer is not found yet. While the current value is larger than the value at the stack top, that top's answer is the current value. Push the current index.","Time O(n), space O(n)",
  "function nextGreater(a) {\n  const res = new Array(a.length).fill(-1), st = [];\n  for (let i = 0; i < a.length; i++) {\n    while (st.length && a[st[st.length - 1]] < a[i]) res[st.pop()] = a[i];\n    st.push(i);\n  }\n  return res;\n}","nextGreater",tags=["stack","array"])
q("amazon","Print a binary tree in vertical order","Print the nodes of a binary tree column by column, from the leftmost vertical line to the rightmost.","DSA","Medium","Technical Interview",CR,["A2"],"SDE-1",
  "Do a level-order traversal and give each node a horizontal distance: root 0, left child minus 1, right child plus 1. Group nodes by distance in a map, then print the groups from the smallest distance to the largest.","Time O(n log n) with a sorted map, space O(n)",tags=["binary-tree","bfs"])
q("amazon","Design an LRU cache","Design a cache with a fixed capacity that supports get(key) and put(key, value) in O(1) time and evicts the least recently used entry when full.","DSA","Medium","Technical Interview",CR,["A2"],"SDE-1",
  "Combine a hash map with a doubly linked list ordered by recent use. The JavaScript Map below keeps insertion order, so deleting and re-inserting a key on every access moves it to the 'most recent' end, and the first key is the least recently used.","get and put O(1), space O(capacity)",
  "class LRUCache {\n  constructor(capacity) { this.cap = capacity; this.m = new Map(); }\n  get(k) {\n    if (!this.m.has(k)) return -1;\n    const v = this.m.get(k);\n    this.m.delete(k);\n    this.m.set(k, v);\n    return v;\n  }\n  put(k, v) {\n    if (this.m.has(k)) this.m.delete(k);\n    this.m.set(k, v);\n    if (this.m.size > this.cap) this.m.delete(this.m.keys().next().value);\n  }\n}","LRUCache",tags=["design","hash-map"])
q("amazon","Minimum number of platforms","Given arrival and departure times of trains at a station, find the minimum number of platforms needed so that no train has to wait.","DSA","Medium","Online Assessment",CR,["A3"],"SDE-1",
  "Sort arrivals and departures separately. Sweep with two pointers: if the next event is an arrival (arrival <= earliest departure) you need one more platform, otherwise a train leaves. Track the maximum.","Time O(n log n), space O(1) extra",
  "function minPlatforms(arr, dep) {\n  const a = [...arr].sort((x, y) => x - y), d = [...dep].sort((x, y) => x - y);\n  let i = 0, j = 0, cur = 0, best = 0;\n  while (i < a.length) {\n    if (a[i] <= d[j]) { cur++; best = Math.max(best, cur); i++; }\n    else { cur--; j++; }\n  }\n  return best;\n}","minPlatforms",tags=["sorting","greedy"])
q("amazon","Bottom view of a binary tree","Print the nodes that are visible when looking at a binary tree from below.","DSA","Medium","Technical Interview",CR,["A3"],"SDE-1",
  "Use level-order traversal with horizontal distances (root 0, left minus 1, right plus 1). For each distance keep overwriting the stored node, so the last node seen at that distance (the lowest) wins. Print in order of distance.","Time O(n log n), space O(n)",tags=["binary-tree","bfs"])
q("amazon","Gas station / circular tour","Several petrol pumps are arranged in a circle. For each pump you know the petrol available and the distance to the next pump. Find a starting pump from which a truck can complete the circle, or report that none exists.","DSA","Medium","Technical Interview",CR,["A5"],"SDE-1",
  "If total petrol is less than total distance, no start works. Otherwise scan once, keeping a running tank; whenever it goes negative, the start must be after the current pump, so reset the tank and move the start.","Time O(n), space O(1)",
  "function canCompleteCircuit(petrol, dist) {\n  let total = 0, tank = 0, start = 0;\n  for (let i = 0; i < petrol.length; i++) {\n    const d = petrol[i] - dist[i];\n    total += d;\n    tank += d;\n    if (tank < 0) { start = i + 1; tank = 0; }\n  }\n  return total >= 0 ? start : -1;\n}","canCompleteCircuit",tags=["greedy","array"])
q("amazon","Necessary conditions for deadlock","State the conditions that must all hold for a deadlock to occur and give an example of each.","OS","Easy","Technical Interview",CR,["A4"],"SDE-1",
  "The four conditions are mutual exclusion (a resource is used by one process at a time), hold and wait (a process holds one resource while waiting for another), no preemption (resources cannot be taken away) and circular wait (a cycle of processes each waiting for the next). Example: thread 1 locks A then wants B, while thread 2 locks B then wants A.",tags=["os","deadlock"])
q("amazon","Tell me about a time you took ownership of a problem","Describe a situation where you took responsibility for a problem that was not strictly yours. What did you do and what was the result?","Behavioral","Medium","Behavioral / managerial",PR,[],"SDE-1",
  "Use the STAR structure: Situation, Task, Action, Result. Keep the focus on your own actions and give a measurable result.",
  notes="Practice question. Candidates report Amazon's Leadership Principles come up in interviews, but this exact wording is ours and is not a reported question.",tags=["leadership-principles"])

# ---- Microsoft ----
q("microsoft","Check if brackets are balanced","Given a string made of (), {} and [], check whether every bracket is closed by the right type and in the right order.","DSA","Easy","Technical Interview",CR,["M1"],"SDE Intern",
  "Push opening brackets on a stack. For each closing bracket, pop and check it matches. The string is balanced if no mismatch occurs and the stack is empty at the end.","Time O(n), space O(n)",
  "function isBalanced(s) {\n  const pair = { ')': '(', ']': '[', '}': '{' }, st = [];\n  for (const c of s) {\n    if ('([{'.includes(c)) st.push(c);\n    else if (pair[c]) { if (st.pop() !== pair[c]) return false; }\n  }\n  return st.length === 0;\n}","isBalanced",tags=["stack","string"])
q("microsoft","Length of the longest increasing subsequence","Given an array of integers, find the length of its longest strictly increasing subsequence (elements need not be adjacent).","DSA","Medium","Online Assessment",CR,["M2"],"SDE Intern",
  "Maintain an array 'tails' where tails[k] is the smallest possible last value of an increasing subsequence of length k+1. For each number, binary search its position in tails and overwrite it (or append). The final length of tails is the answer.","Time O(n log n), space O(n)",
  "function lisLength(a) {\n  const t = [];\n  for (const x of a) {\n    let lo = 0, hi = t.length;\n    while (lo < hi) {\n      const m = (lo + hi) >> 1;\n      if (t[m] < x) lo = m + 1; else hi = m;\n    }\n    t[lo] = x;\n  }\n  return t.length;\n}","lisLength",tags=["dp","binary-search"])
q("microsoft","Boundary traversal of a binary tree, alternate nodes only","Print the boundary of a binary tree (left edge, leaves, right edge) but only every alternate node of that boundary.","DSA","Medium","Technical Interview",CR,["M2"],"SDE Intern",
  "Collect the normal boundary in order: left boundary top-down (without leaves), all leaves left to right, right boundary bottom-up (without leaves). Then print every second element of that list.","Time O(n), space O(n)",
  notes="The candidate describes this as a variation of the standard boundary traversal problem.",tags=["binary-tree"])
q("microsoft","Evaluate a boolean expression given as a string","Given a boolean expression written as a string, compute its value.","DSA","Medium","Online Assessment",CR,["M6"],"SDE Intern",
  "Parse with two stacks (operands and operators) using operator precedence, or convert to postfix and evaluate with a stack.","Time O(n), space O(n)",
  notes="The exact operators and format are not recorded here. Check the source page for the original problem.",tags=["stack","parsing"])
q("microsoft","Tell me about a time you worked in a team","Describe a project where you worked with others. What was your role, how did you handle disagreements, and what did the team achieve?","Behavioral","Easy","Final (AA) round",PR,[],"SDE / SWE-1",
  "Use the STAR structure and be specific about your own contribution and what you learned.",
  notes="Practice question. Candidates report behavioral and teamwork questions in Microsoft's final round, but this exact wording is ours.",tags=["teamwork"])

# ---- TCS ----
q("tcs","Difference between C and C++","Explain how C and C++ differ.","Programming","Easy","Technical Interview",CR,["T2"],"Ninja",
  "C is a procedural language. C++ adds classes and objects, inheritance and polymorphism, references, function and operator overloading, templates, exceptions and the STL, and supports both procedural and object-oriented styles.",tags=["c","cpp"])
q("tcs","What is OOP? Explain its principles","Explain object-oriented programming and its main principles.","OOP","Easy","Technical Interview",CR,["T3"],"Ninja",
  "OOP organises code around objects that combine data and behaviour. The four principles are encapsulation (hide data behind methods), abstraction (expose only what is needed), inheritance (reuse and extend classes) and polymorphism (one interface, many implementations). Give a real-life example for each.",tags=["oop"])
q("tcs","Purpose of the volatile keyword","Explain how and why the volatile keyword is used.","OOP","Medium","Technical Interview",CR,["T3"],"Ninja",
  "In C and C++, volatile tells the compiler a variable may change outside the program's normal flow (hardware register, signal handler, another thread), so every read and write must really happen and not be optimised away. It does not make operations atomic or thread-safe. In Java, volatile instead guarantees visibility and ordering of a field across threads.",tags=["c","java"])
q("tcs","Lemmatization, stop words and tokenization in NLP","Explain what tokenization, stop words and lemmatization mean in natural language processing.","Other","Medium","Technical Interview",CR,["T5"],"Ninja",
  "Tokenization splits text into units such as words. Stop words are very common words (for example 'the', 'is') often removed because they carry little meaning. Lemmatization reduces a word to its dictionary base form using grammar, so 'running' becomes 'run'.",tags=["nlp"])
q("tcs","Tell me about yourself","Introduce yourself.","HR","Easy","Technical Interview",CR,["T4"],"Ninja",
  "Give a 60 to 90 second summary: your education, one or two projects or skills that match the role, and why you want this job. Do not read out your resume line by line.",tags=["hr"])
q("tcs","Where do you see yourself in five years?","Describe where you want to be professionally in five years.","HR","Easy","HR Interview",CR,["T6"],"Ninja",
  "Show that you want to grow with the company: building skills, taking on responsibility and contributing to real projects. Avoid naming a different company or career.",tags=["hr"])
q("tcs","Walk me through your projects","Describe the projects you have worked on.","Other","Easy","Technical Interview",CR,["T4"],"Ninja",
  "For each project be ready to explain the problem, your own role, the technology and why you chose it, one difficulty you solved, and the result. Interviewers often ask follow-up questions on anything written on your resume.",tags=["projects"])

# ---- Infosys ----
q("infosys","Explain OOP concepts with real-life examples","Explain the main object-oriented programming concepts using everyday examples.","OOP","Easy","Technical Interview",CR,["I1"],"System Engineer",
  "Cover encapsulation, abstraction, inheritance and polymorphism. Example: a car (class) with private engine details (encapsulation), a simple pedal interface (abstraction), an ElectricCar that extends Car (inheritance), and different cars responding differently to accelerate() (polymorphism).",tags=["oop"])
q("infosys","Normal forms in DBMS","Explain database normalization and the normal forms.","DBMS","Medium","Technical Interview",CR,["I1"],"System Engineer",
  "Normalization removes redundancy. 1NF: every column holds atomic values. 2NF: 1NF and no partial dependency of non-key columns on part of a composite key. 3NF: 2NF and no transitive dependency between non-key columns. BCNF: for every dependency X to Y, X is a superkey.",tags=["dbms"])
q("infosys","Operator overloading vs function overriding","Explain operator overloading and function overriding and how they differ.","OOP","Medium","Technical Interview",CR,["I2"],"System Engineer",
  "Operator overloading gives an operator a new meaning for user-defined types and is resolved at compile time. Function overriding is when a derived class redefines a base class virtual function with the same signature and is resolved at run time (dynamic dispatch). Overloading is about different signatures in one scope; overriding is about the same signature across classes.",tags=["cpp","oop"])
q("infosys","Friend functions in C++","What is a friend function and when would you use one?","OOP","Medium","Technical Interview",CR,["I2"],"System Engineer",
  "A friend function is declared inside a class with the friend keyword. It is not a member, but it can access the class's private and protected members. It is not inherited. It is useful for operators such as << but it weakens encapsulation, so use it sparingly.",tags=["cpp"])
q("infosys","Header files in C","What are header files in C and why do we use them?","Programming","Easy","Technical Interview",CR,["I2"],"System Engineer",
  "A header file holds declarations (function prototypes, macros, types) that many source files share. #include copies it into a file before compilation. Include guards (#ifndef / #define / #endif) stop a header being included twice.",tags=["c"])
q("infosys","SQL queries using GROUP BY","Write queries that use GROUP BY, for example counting employees per department.","SQL","Easy","Technical Interview",CR,["I5"],"System Engineer",
  "GROUP BY collapses rows with the same value into one row so you can use aggregates. Example: SELECT dept, COUNT(*) FROM employee GROUP BY dept; add HAVING COUNT(*) > 5 to keep only large departments (HAVING filters groups, WHERE filters rows).",
  notes="The reviewer only says two GROUP BY queries were asked; the example here is ours.",tags=["sql"])
q("infosys","Why Infosys? Are you willing to relocate?","Why do you want to join this company, and can you relocate?","HR","Easy","HR Interview",CR,["I3"],"System Engineer",
  "Give honest reasons tied to the company (training, projects, growth) and say clearly whether you can relocate or work shifts.",tags=["hr"])

# ---- General practice (no company) ----
q(None,"Reverse a linked list","Reverse a singly linked list and return the new head.","DSA","Easy","Practice",PR,[],None,
  "Walk the list with three pointers (prev, current, next). At each step point current.next to prev, then advance all three.","Time O(n), space O(1)",tags=["linked-list"])
q(None,"Find the missing number","An array holds the numbers 1 to n with exactly one number missing. Find it.","DSA","Easy","Practice",PR,[],None,
  "XOR all numbers from 1 to n with all array elements; equal values cancel and the missing number remains. (The sum formula n(n+1)/2 minus the array sum also works.)","Time O(n), space O(1)",
  "function missingNumber(a) {\n  const n = a.length + 1;\n  let x = 0;\n  for (let i = 1; i <= n; i++) x ^= i;\n  for (const v of a) x ^= v;\n  return x;\n}","missingNumber",tags=["array","bit-manipulation"])
q(None,"ACID properties of a transaction","Explain the ACID properties in a database.","DBMS","Easy","Practice",PR,[],None,
  "Atomicity: all steps happen or none do. Consistency: a transaction moves the database from one valid state to another. Isolation: concurrent transactions do not see each other's partial work. Durability: committed data survives crashes.",tags=["dbms","transactions"])
q(None,"Process vs thread","Explain the difference between a process and a thread.","OS","Easy","Practice",PR,[],None,
  "A process is a running program with its own address space and resources. Threads are lightweight units inside a process that share its memory and resources but have their own stack and registers. Switching between threads is cheaper, but shared memory needs synchronization.",tags=["os"])
q(None,"TCP vs UDP","Compare TCP and UDP.","Networks","Easy","Practice",PR,[],None,
  "TCP is connection-oriented and reliable: it orders data, retransmits lost packets and controls congestion, at the cost of overhead. UDP is connectionless with no delivery guarantee, so it is faster and suits streaming, gaming and DNS.",tags=["networks"])
q(None,"INNER JOIN vs LEFT JOIN","What is the difference between INNER JOIN and LEFT JOIN?","SQL","Easy","Practice",PR,[],None,
  "INNER JOIN returns only rows with a match in both tables. LEFT JOIN returns every row of the left table and fills the right table's columns with NULL when there is no match.",tags=["sql","joins"])
q(None,"Speed of a train crossing a pole","A train 150 m long passes a telegraph pole in 15 seconds. What is its speed in km/h?","Aptitude","Easy","Practice",PR,[],None,
  "Speed = distance / time = 150 / 15 = 10 m/s. Multiply by 18/5 to convert to km/h: 10 x 18/5 = 36 km/h.",tags=["aptitude","speed-distance-time"])
q(None,"Describe a disagreement with a teammate","Tell me about a time you disagreed with a teammate and how you resolved it.","Behavioral","Medium","Practice",PR,[],None,
  "Use STAR. Show that you listened, focused on the goal rather than the person, and reached a decision the team could support.",tags=["teamwork"])

import re
def norm(t): return re.sub(r"[^a-z0-9]+","-",t.lower()).strip("-")
for x in Q: x["dedupeKey"] = f'{x["company"] or "general"}:{norm(x["title"])}'
assert len({x["dedupeKey"] for x in Q}) == len(Q), "duplicate dedupeKey"
for x in Q:
    assert x["verificationStatus"] == PR or x["sources"], f'{x["title"]}: reported question without a source'
    assert not (x["verificationStatus"] == PR and x["sources"]), f'{x["title"]}: practice question must not cite a source as evidence'
    assert bool(x["solutionCode"]) == bool(x["codeEntry"])
json.dump(dict(generated=ACC, note="Question wording is original. Sources are public pages read on the accessed date. 'sourceDate' is the page's last-updated date, not the interview date.", companies=COMPANIES, questions=Q),
          open("data/research/dataset.json","w"), indent=1, ensure_ascii=False)
from collections import Counter
print(len(COMPANIES),"companies,",len(Q),"questions")
print(Counter((x["company"] or "general", x["verificationStatus"]) for x in Q))
