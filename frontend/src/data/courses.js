export const courses = [
  {
    id: 'python-basics',
    title: 'Python Fundamentals',
    icon: '🐍',
    description: 'Master Python from zero to confident programmer',
    color: '#306998',
    modules: [
      {
        id: 'variables',
        title: 'Variables & Data Types',
        lessons: [
          {
            id: 'what-is-variable',
            title: 'What is a Variable?',
            content: `
## What is a Variable?

A **variable** is a named container that stores a value. Think of it as a labeled box where you put things.

### Real-World Analogy
Imagine you have boxes in your room:
- A box labeled "Name" contains "Mayank"
- A box labeled "Age" contains 25
- A box labeled "Height" contains 5.9

In Python, we create variables like this:

\`\`\`python
# Creating variables (putting values in boxes)
name = "Mayank"          # string (text)
age = 25                 # integer (whole number)
height = 5.9             # float (decimal)
is_student = True        # boolean (True/False)
\`\`\`

### Key Points
- The \`=\` sign means "assign" (put the value in the box)
- The name on the left is the label
- The value on the right is what goes inside
            `,
            codeExample: {
              title: 'Try It Yourself',
              code: `# Create your own variables
my_name = "Your Name"
my_age = 20
my_height = 5.8
likes_python = True

# Print them
print(my_name)
print(my_age)
print(my_height)
print(likes_python)

# Check the type of each variable
print(type(my_name))      # <class 'str'>
print(type(my_age))       # <class 'int'>
print(type(my_height))    # <class 'float'>
print(type(likes_python)) # <class 'bool'>`,
              output: `Your Name
20
5.8
True
<class 'str'>
<class 'int'>
<class 'float'>
<class 'bool'>`
            }
          },
          {
            id: 'data-types',
            title: 'The 4 Basic Data Types',
            content: `
## The 4 Basic Data Types

Every value in Python has a **type**. Here are the 4 fundamental types:

| Type | Name | What It Stores | Example |
|------|------|----------------|---------|
| \`str\` | String | Text | \`"hello"\`, \`'world'\` |
| \`int\` | Integer | Whole numbers | \`42\`, \`-7\`, \`0\` |
| \`float\` | Float | Decimal numbers | \`3.14\`, \`-0.5\` |
| \`bool\` | Boolean | True/False | \`True\`, \`False\` |

### Type Conversion (Casting)
You can convert between types:

\`\`\`python
# String to integer
num_str = "42"
num_int = int(num_str)      # Now it's 42 (number)
print(num_int + 8)          # 50

# Integer to string
age = 25
age_str = str(age)          # Now it's "25" (text)

# Float to integer (truncates decimal)
pi = 3.14
print(int(pi))              # 3 (not 4!)
\`\`\`

### Common Mistake
\`\`\`python
# This causes an error!
age = "25"
# print(age + 5)  # TypeError: can only concatenate str to str

# Fix: convert to int first
print(int(age) + 5)  # 30 ✓
\`\`\`
            `,
            codeExample: {
              title: 'Type Conversion Practice',
              code: `# Type conversion exercises
price_str = "19.99"
price_float = float(price_str)
print(f"Price as float: {price_float}")
print(f"Price doubled: {price_float * 2}")

# Integer division vs float division
print(10 / 3)    # 3.3333... (float)
print(10 // 3)   # 3 (integer, truncates)

# Boolean conversions
print(bool(0))     # False (0 is falsy)
print(bool(1))     # True (non-zero is truthy)
print(bool(""))    # False (empty string is falsy)
print(bool("hi"))  # True (non-empty is truthy)`,
              output: `Price as float: 19.99
Price doubled: 39.98
3.3333333333333335
3
False
True
False
True`
            }
          },
          {
            id: 'naming-rules',
            title: 'Variable Naming Rules',
            content: `
## Variable Naming Rules

Python has strict rules for naming variables. Break them and you get errors.

### Valid Names ✓
\`\`\`python
name = "Mayank"
_count = 10
myVariable = "camelCase"
MAX_SIZE = 100    # Usually for constants
\`\`\`

### Invalid Names ✗
\`\`\`python
# 2name = "bad"    ← Can't start with number
# my-name = "bad"  ← No hyphens (minus sign)
# my name = "bad"  ← No spaces
# class = "bad"    ← Can't use Python keywords
\`\`\`

### Best Practices (PEP 8 Style)
\`\`\`python
# Use snake_case for variables and functions
user_name = "Mayank"
total_count = 42

# Use UPPER_CASE for constants
MAX_RETRIES = 3
PI = 3.14159

# Use descriptive names
x = 10           # Bad - what is x?
user_age = 10    # Good - clear meaning
\`\`\`

### Python Keywords (Reserved Words)
These words have special meaning — you CANNOT use them as variable names:
\`if, else, for, while, def, class, import, return, True, False, None, and, or, not, in, is, try, except, finally, with, as, from, lambda, yield\`
            `,
            codeExample: {
              title: 'Naming Practice',
              code: `# Good variable names (snake_case)
first_name = "Mayank"
last_name = "Chand"
user_age = 25
is_employed = True
total_salary = 75000.00

# Constants (UPPER_CASE)
MAX_FILE_SIZE = 1048576
API_TIMEOUT = 30
DEFAULT_LANGUAGE = "Python"

print(f"{first_name} {last_name}")
print(f"Age: {user_age}")
print(f"Employed: {is_employed}")
print("Salary: $" + str(total_salary))`,
              output: `Mayank Chand
Age: 25
Employed: True
Salary: $75,000.00`
            }
          },
          {
            id: 'input-output',
            title: 'Input & Output',
            content: `
## Input & Output (I/O)

### Getting User Input
Use \`input()\` to get text from the user:

\`\`\`python
# input() always returns a string
name = input("What is your name? ")
print(f"Hello, {name}!")

# Convert input to number
age = int(input("How old are you? "))
print(f"In 10 years, you'll be {age + 10}")
\`\`\`

### Printing Output
\`\`\`python
# Basic print
print("Hello, World!")

# Print multiple values
print("Name:", name, "Age:", age)

# f-strings (formatted strings) - BEST WAY
print(f"My name is {name} and I am {age} years old")

# Format numbers
price = 49.99
print("Price: $" + str(price))   # $49.99
print(f"Large: {1000000:,}")    # 1,000,000
\`\`\`

### f-string Formatting Tricks
\`\`\`python
name = "Mayank"
score = 95.678

# Round to 2 decimal places
print(f"Score: {score:.2f}")      # 95.68

# Pad with zeros
print(f"ID: {42:05d}")           # ID: 00042

# Left/Right align
print(f"{name:>20}")              # '              Mayank'
print(f"{name:<20}")              # 'Mayank              '
print(f"{name:^20}")              # '       Mayank       '
\`\`\`
            `,
            codeExample: {
              title: 'Interactive Calculator',
              code: `# Simple calculator using input
print("=== Simple Calculator ===")

num1 = float(input("Enter first number: "))
operator = input("Enter operator (+, -, *, /): ")
num2 = float(input("Enter second number: "))

if operator == "+":
    result = num1 + num2
elif operator == "-":
    result = num1 - num2
elif operator == "*":
    result = num1 * num2
elif operator == "/":
    result = num1 / num2 if num2 != 0 else "Error: Division by zero"
else:
    result = "Invalid operator"

print(f"\\n{num1} {operator} {num2} = {result}")`,
              output: `=== Simple Calculator ===
Enter first number: 10
Enter operator (+, -, *, /): *
Enter second number: 5

10.0 * 5.0 = 50.0`
            }
          }
        ],
        quiz: {
          title: 'Variables & Data Types Quiz',
          questions: [
            {
              question: 'What is the type of `"3.14"` in Python?',
              options: ['float', 'int', 'str', 'bool'],
              correct: 2,
              explanation: '"3.14" is wrapped in quotes, making it a string (str), not a number.'
            },
            {
              question: 'What will `int(3.9)` return?',
              options: ['4', '3', '3.9', 'Error'],
              correct: 1,
              explanation: 'int() truncates (cuts off decimal), it does NOT round. So int(3.9) = 3.'
            },
            {
              question: 'Which is a valid variable name?',
              options: ['2name', 'my-name', 'my_name', 'my name'],
              correct: 2,
              explanation: 'my_name uses underscore, which is valid. Names cannot start with numbers, contain hyphens, or spaces.'
            },
            {
              question: 'What does `input()` always return?',
              options: ['int', 'float', 'str', 'bool'],
              correct: 2,
              explanation: 'input() always returns a string, even if the user types a number. Use int() or float() to convert.'
            },
            {
              question: 'What is `True` in Python?',
              options: ['string', 'integer', 'boolean', 'variable'],
              correct: 2,
              explanation: 'True is a boolean value representing truth.'
            }
          ]
        }
      },
      {
        id: 'operators',
        title: 'Operators & Expressions',
        lessons: [
          {
            id: 'arithmetic-operators',
            title: 'Arithmetic Operators',
            content: `
## Arithmetic Operators

Python has 7 arithmetic operators for math operations:

| Operator | Name | Example | Result |
|----------|------|---------|--------|
| \`+\` | Addition | \`5 + 3\` | \`8\` |
| \`-\` | Subtraction | \`5 - 3\` | \`2\` |
| \`*\` | Multiplication | \`5 * 3\` | \`15\` |
| \`/\` | Division | \`5 / 3\` | \`1.6667\` |
| \`//\` | Floor Division | \`5 // 3\` | \`1\` |
| \`%\` | Modulus (remainder) | \`5 % 3\` | \`2\` |
| \`**\` | Exponentiation | \`5 ** 3\` | \`125\` |

### Important: Division Always Returns Float
\`\`\`python
print(10 / 2)    # 5.0 (float, not 5)
print(10 / 3)    # 3.3333333333333335
print(10 // 3)   # 3 (floor division - drops decimal)
\`\`\`

### Real-World Example: Calculate Tip
\`\`\`python
bill = 85.50
tip_percent = 18
tip = bill * (tip_percent / 100)
total = bill + tip
print("Bill: $" + str(bill))
print("Tip (" + str(tip_percent) + "%): $" + str(tip))
print("Total: $" + str(total))
\`\`\`
            `,
            codeExample: {
              title: 'Arithmetic Operations',
              code: `# All 7 arithmetic operators
a = 17
b = 5

print(f"{a} + {b} = {a + b}")    # 22
print(f"{a} - {b} = {a - b}")    # 12
print(f"{a} * {b} = {a * b}")    # 85
print(f"{a} / {b} = {a / b}")    # 3.4
print(f"{a} // {b} = {a // b}")  # 3
print(f"{a} % {b} = {a % b}")    # 2
print(f"{a} ** {b} = {a ** b}")  # 1419857

# Practical: Convert temperature
celsius = 100
fahrenheit = (celsius * 9/5) + 32
print(f"{celsius}°C = {fahrenheit}°F")`,
              output: `17 + 5 = 22
17 - 5 = 12
17 * 5 = 85
17 / 5 = 3.4
17 // 5 = 3
17 % 5 = 2
17 ** 5 = 1419857
100°C = 212.0°F`
            }
          },
          {
            id: 'comparison-operators',
            title: 'Comparison & Logical Operators',
            content: `
## Comparison Operators

These compare two values and return \`True\` or \`False\`:

| Operator | Meaning | Example | Result |
|----------|---------|---------|--------|
| \`==\` | Equal to | \`5 == 5\` | \`True\` |
| \`!=\` | Not equal to | \`5 != 3\` | \`True\` |
| \`>\` | Greater than | \`5 > 3\` | \`True\` |
| \`<\` | Less than | \`5 < 3\` | \`False\` |
| \`>=\` | Greater or equal | \`5 >= 5\` | \`True\` |
| \`<=\` | Less or equal | \`5 <= 3\` | \`False\` |

## Logical Operators

Combine multiple conditions:

| Operator | Meaning | Example | Result |
|----------|---------|---------|--------|
| \`and\` | Both must be True | \`True and False\` | \`False\` |
| \`or\` | At least one True | \`True or False\` | \`True\` |
| \`not\` | Reverses True/False | \`not True\` | \`False\` |

### Example
\`\`\`python
age = 25
income = 50000

# Check if qualifies for loan
if age >= 18 and income >= 30000:
    print("You qualify!")
\`\`\`
            `,
            codeExample: {
              title: 'Comparison & Logic Practice',
              code: `# Comparison operators
x = 10
y = 20

print(f"{x} == {y}: {x == y}")   # False
print(f"{x} != {y}: {x != y}")   # True
print(f"{x} > {y}: {x > y}")     # False
print(f"{x} < {y}: {x < y}")     # True
print(f"{x} >= {y}: {x >= y}")   # False
print(f"{x} <= {y}: {x <= y}")   # True

# Logical operators
is_raining = True
has_umbrella = False

# Should you go outside?
go_outside = not is_raining or has_umbrella
print(f"Go outside? {go_outside}")  # True

# Check if number is in range
score = 85
if score >= 80 and score <= 100:
    print("Grade: A")`,
              output: `10 == 20: False
10 != 20: True
10 > 20: False
10 < 20: True
10 >= 20: False
10 <= 20: True
Go outside? True
Grade: A`
            }
          }
        ],
        quiz: {
          title: 'Operators Quiz',
          questions: [
            {
              question: 'What is `10 // 3`?',
              options: ['3.333', '3', '4', 'Error'],
              correct: 1,
              explanation: '// is floor division. It divides and drops the decimal, giving 3.'
            },
            {
              question: 'What is `10 % 3`?',
              options: ['3', '1', '0', '3.33'],
              correct: 1,
              explanation: '% is modulus. It gives the remainder: 10 ÷ 3 = 3 remainder 1.'
            },
            {
              question: 'What does `5 == "5"` return?',
              options: ['True', 'False', 'Error', 'None'],
              correct: 1,
              explanation: '5 == "5" is False because they are different types (int vs string). Python does not auto-convert for ==.'
            },
            {
              question: 'What is `not (True and False)`?',
              options: ['True', 'False', 'Error', 'None'],
              correct: 0,
              explanation: 'True and False = False, then not False = True.'
            }
          ]
        }
      },
      {
        id: 'conditionals',
        title: 'If/Else Statements',
        lessons: [
          {
            id: 'if-else-basics',
            title: 'If/Else Basics',
            content: `
## If/Else Statements

Conditional statements let your program make decisions. Think of it like a fork in the road.

### Basic Structure
\`\`\`python
if condition:
    # runs if condition is True
elif another_condition:
    # runs if first was False AND this is True
else:
    # runs if all above were False
\`\`\`

### Real-World Example
\`\`\`python
temperature = 35

if temperature > 30:
    print("It's hot! Wear shorts.")
elif temperature > 20:
    print("Nice weather! Wear a t-shirt.")
elif temperature > 10:
    print("Cool. Wear a jacket.")
else:
    print("Cold! Wear a coat.")
\`\`\`

### Important Rules
- The colon \`:\` is required after each condition
- Indentation (4 spaces) defines the code block
- Only ONE block runs (the first True condition)
            `,
            codeExample: {
              title: 'Grade Calculator',
              code: `# Grade calculator
score = int(input("Enter your score (0-100): "))

if score >= 90:
    grade = "A"
    comment = "Excellent!"
elif score >= 80:
    grade = "B"
    comment = "Good job!"
elif score >= 70:
    grade = "C"
    comment = "Not bad!"
elif score >= 60:
    grade = "D"
    comment = "Needs improvement"
else:
    grade = "F"
    comment = "Study harder!"

print(f"Score: {score}")
print(f"Grade: {grade}")
print(f"Comment: {comment}")`,
              output: `Enter your score (0-100): 85
Score: 85
Grade: B
Comment: Good job!`
            }
          },
          {
            id: 'nested-if',
            title: 'Nested If & Complex Conditions',
            content: `
## Nested If Statements

You can put if/else inside another if/else:

\`\`\`python
age = 25
has_license = True

if age >= 18:
    if has_license:
        print("You can drive!")
    else:
        print("Get a license first.")
else:
    print("Too young to drive.")
\`\`\`

### Cleaner Way: Use \`and\`/\`or\`
\`\`\`python
# Instead of nested if
if age >= 18 and has_license:
    print("You can drive!")
elif age >= 18:
    print("Get a license first.")
else:
    print("Too young to drive.")
\`\`\`

### Ternary Operator (One-Line If/Else)
\`\`\`python
age = 20
status = "adult" if age >= 18 else "minor"
print(status)  # adult
\`\`\`
            `,
            codeExample: {
              title: 'Login System',
              code: `# Simple login system
correct_username = "admin"
correct_password = "secret123"

username = input("Username: ")
password = input("Password: ")

if username == correct_username and password == correct_password:
    print("Login successful! Welcome!")
elif username == correct_username:
    print("Wrong password. Try again.")
elif password == correct_password:
    print("Unknown username. Try again.")
else:
    print("Invalid username and password.")`,
              output: `Username: admin
Password: wrong
Wrong password. Try again.`
            }
          }
        ],
        quiz: {
          title: 'If/Else Quiz',
          questions: [
            {
              question: 'How many elif blocks can an if statement have?',
              options: ['Only 1', 'Only 2', 'Unlimited', 'None'],
              correct: 2,
              explanation: 'You can have as many elif blocks as you need.'
            },
            {
              question: 'What happens if no condition is True and there is no else?',
              options: ['Error', 'Nothing runs', 'All run', 'First runs'],
              correct: 1,
              explanation: 'If no condition matches and there is no else, nothing happens - the code just continues.'
            },
            {
              question: 'What is the output?',
              code: 'x = 5\nif x > 3:\n    print("big")\nelif x > 1:\n    print("medium")\nelse:\n    print("small")',
              options: ['big', 'medium', 'small', 'big and medium'],
              correct: 0,
              explanation: 'x=5 > 3 is True, so only "big" prints. The rest is skipped.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'python-intermediate',
    title: 'Python Intermediate',
    icon: '📚',
    description: 'Functions, loops, lists, dictionaries, and more',
    color: '#19c37d',
    modules: [
      {
        id: 'lists',
        title: 'Lists & Tuples',
        lessons: [
          {
            id: 'list-basics',
            title: 'Lists - Ordered Collections',
            content: `
## Lists

A **list** is an ordered collection of items. Think of it as a shelf with numbered spots.

\`\`\`python
# Creating lists
fruits = ["apple", "banana", "cherry"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]  # Can mix types
empty = []  # Empty list
\`\`\`

### Accessing Items (Indexing)
\`\`\`python
fruits = ["apple", "banana", "cherry"]
# Index:      0        1        2

print(fruits[0])    # "apple" (first)
print(fruits[1])    # "banana" (second)
print(fruits[-1])   # "cherry" (last)
print(fruits[-2])   # "banana" (second to last)
\`\`\`

### Slicing (Getting Sublists)
\`\`\`python
numbers = [0, 1, 2, 3, 4, 5]
print(numbers[1:4])   # [1, 2, 3] (index 1 to 3)
print(numbers[:3])    # [0, 1, 2] (first 3)
print(numbers[2:])    # [2, 3, 4, 5] (from index 2)
print(numbers[::2])   # [0, 2, 4] (every other)
\`\`\`
            `,
            codeExample: {
              title: 'List Operations',
              code: `# List operations
fruits = ["apple", "banana", "cherry"]

# Add items
fruits.append("orange")     # Add to end
fruits.insert(1, "mango")   # Insert at index 1

# Remove items
fruits.remove("banana")     # Remove by value
popped = fruits.pop()       # Remove and return last

# Other operations
print(f"List: {fruits}")
print(f"Length: {len(fruits)}")
print(f"apple index: {fruits.index('apple')}")
print(f"Has cherry: {'cherry' in fruits}")

# Sort
numbers = [3, 1, 4, 1, 5, 9]
numbers.sort()
print(f"Sorted: {numbers}")`,
              output: `List: ['apple', 'mango', 'cherry']
Length: 3
apple index: 0
Has cherry: True
Sorted: [1, 1, 3, 4, 5, 9]`
            }
          },
          {
            id: 'list-comprehensions',
            title: 'List Comprehensions',
            content: `
## List Comprehensions

A compact way to create lists. One line instead of multiple.

### Basic Syntax
\`\`\`python
# Traditional way
squares = []
for x in range(5):
    squares.append(x ** 2)

# List comprehension (same result, one line)
squares = [x ** 2 for x in range(5)]
# Result: [0, 1, 4, 9, 16]
\`\`\`

### With Condition
\`\`\`python
# Only even numbers
evens = [x for x in range(10) if x % 2 == 0]
# Result: [0, 2, 4, 6, 8]

# Names starting with 'M'
names = ["Mayank", "Ali", "Mike", "Sara"]
m_names = [n for n in names if n.startswith('M')]
# Result: ['Mayank', 'Mike']
\`\`\`

### Transform + Filter
\`\`\`python
# Convert to uppercase and filter
words = ["hello", "world", "python"]
upper = [w.upper() for w in words]
# Result: ['HELLO', 'WORLD', 'PYTHON']
\`\`\`
            `,
            codeExample: {
              title: 'List Comprehension Examples',
              code: `# Basic list comprehensions
squares = [x**2 for x in range(10)]
print(f"Squares: {squares}")

# With condition
evens = [x for x in range(20) if x % 2 == 0]
print(f"Evens: {evens}")

# Transform strings
words = ["hello", "world", "python", "ai"]
lengths = [len(w) for w in words]
print(f"Lengths: {lengths}")

# Nested list comprehension
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [num for row in matrix for num in row]
print(f"Flattened: {flat}")

# Real-world: Extract emails
emails = ["user@gmail.com", "invalid@", "test@yahoo.com"]
valid = [e for e in emails if "@" in e and "." in e]
print(f"Valid: {valid}")`,
              output: `Squares: [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
Evens: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]
Lengths: [5, 5, 6, 2]
Flattened: [1, 2, 3, 4, 5, 6, 7, 8, 9]
Valid: ['user@gmail.com', 'test@yahoo.com']`
            }
          }
        ],
        quiz: {
          title: 'Lists Quiz',
          questions: [
            {
              question: 'What is `fruits[-1]` if fruits = ["apple", "banana", "cherry"]?',
              options: ['apple', 'banana', 'cherry', 'Error'],
              correct: 2,
              explanation: 'Negative indexing counts from the end. -1 is the last item: "cherry".'
            },
            {
              question: 'What does `[x**2 for x in range(5)]` return?',
              options: ['[1, 4, 9, 16, 25]', '[0, 1, 4, 9, 16]', '[0, 2, 4, 6, 8]', 'Error'],
              correct: 1,
              explanation: 'range(5) is 0,1,2,3,4. Squaring each gives 0,1,4,9,16.'
            }
          ]
        }
      },
      {
        id: 'loops',
        title: 'For & While Loops',
        lessons: [
          {
            id: 'for-loops',
            title: 'For Loops',
            content: `
## For Loops

A **for loop** repeats code for each item in a sequence.

### Basic Syntax
\`\`\`python
for item in sequence:
    # do something with item
\`\`\`

### Examples
\`\`\`python
# Loop through a list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# Loop through a string
for letter in "Python":
    print(letter)

# Loop with range
for i in range(5):  # 0, 1, 2, 3, 4
    print(i)

# Loop with enumerate (get index + value)
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")
\`\`\`

### Common Patterns
\`\`\`python
# Sum all numbers
total = 0
for num in [10, 20, 30]:
    total += num
print(total)  # 60

# Find maximum
numbers = [5, 2, 8, 1, 9]
max_val = numbers[0]
for num in numbers:
    if num > max_val:
        max_val = num
print(max_val)  # 9
\`\`\`
            `,
            codeExample: {
              title: 'For Loop Examples',
              code: `# Basic for loop
print("Counting:")
for i in range(1, 6):
    print(i, end=" ")
print()  # New line

# Loop through list
colors = ["red", "green", "blue"]
for color in colors:
    print(f"I like {color}")

# Nested loops - multiplication table
print("\\n5x5 Table:")
for i in range(1, 6):
    for j in range(1, 6):
        print(f"{i*j:4}", end="")
    print()

# Practical: Find duplicates
words = ["apple", "banana", "apple", "cherry", "banana"]
seen = []
duplicates = []
for word in words:
    if word in seen:
        duplicates.append(word)
    else:
        seen.append(word)
print(f"\\nDuplicates: {duplicates}")`,
              output: `Counting:
1 2 3 4 5 
I like red
I like green
I like blue

5x5 Table:
   1   2   3   4   5
   2   4   6   8  10
   3   6   9  12  15
   4   8  12  16  20
   5  10  15  20  25

Duplicates: ['apple', 'banana']`
            }
          },
          {
            id: 'while-loops',
            title: 'While Loops',
            content: `
## While Loops

A **while loop** repeats as long as a condition is True.

### Basic Syntax
\`\`\`python
while condition:
    # code runs
    # condition must eventually become False!
\`\`\`

### ⚠️ Watch Out for Infinite Loops!
\`\`\`python
# BAD - infinite loop
# while True:
#     print("forever")  # runs forever!

# GOOD - has a way out
count = 0
while count < 5:
    print(count)
    count += 1  # This eventually stops it
\`\`\`

### When to Use While vs For
- **for loop**: When you know how many times to repeat
- **while loop**: When you don't know when to stop

\`\`\`python
# for loop: iterate over known items
for i in range(10):  # exactly 10 times

# while loop: wait for a condition
password = ""
while password != "secret":
    password = input("Enter password: ")
\`\`\`
            `,
            codeExample: {
              title: 'While Loop Examples',
              code: `# Countdown
print("Countdown:")
count = 5
while count > 0:
    print(count, end="... ")
    count -= 1
print("Liftoff!")

# Number guessing game
import random
secret = random.randint(1, 10)
guess = 0
attempts = 0

print("\\nGuess the number (1-10):")
while guess != secret:
    guess = int(input("Your guess: "))
    attempts += 1
    if guess < secret:
        print("Too low!")
    elif guess > secret:
        print("Too high!")

print(f"Correct! You got it in {attempts} tries.")`,
              output: `Countdown:
5... 4... 3... 2... 1... Liftoff!

Guess the number (1-10):
Your guess: 5
Too high!
Your guess: 3
Too low!
Your guess: 4
Correct! You got it in 3 tries.`
            }
          }
        ],
        quiz: {
          title: 'Loops Quiz',
          questions: [
            {
              question: 'What will this print?',
              code: 'for i in range(3):\n    print(i)',
              options: ['0, 1, 2', '1, 2, 3', '0, 1, 2, 3', '1, 2'],
              correct: 0,
              explanation: 'range(3) gives 0, 1, 2 (starts at 0, stops before 3).'
            },
            {
              question: 'When should you use a while loop instead of a for loop?',
              options: ['Always', 'When iterating over a list', 'When you don\'t know when to stop', 'Never'],
              correct: 2,
              explanation: 'While loops are best when the number of iterations is unknown and depends on a condition.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'numpy',
    title: 'NumPy',
    icon: '🔢',
    description: 'Fast numerical computing with arrays',
    color: '#4DABCF',
    modules: [
      {
        id: 'numpy-basics',
        title: 'NumPy Arrays',
        lessons: [
          {
            id: 'why-numpy',
            title: 'Why NumPy?',
            content: `
## Why NumPy?

NumPy is the foundation of Data Science in Python. It's **100x faster** than regular Python lists for math operations.

### Python Lists vs NumPy Arrays
\`\`\`python
import numpy as np

# Python list
py_list = [1, 2, 3, 4, 5]

# NumPy array
np_array = np.array([1, 2, 3, 4, 5])
\`\`\`

### Why NumPy is Faster
\`\`\`python
import numpy as np
import time

# Python list: slow
py_list = list(range(1000000))
start = time.time()
result = [x * 2 for x in py_list]
print(f"Python list: {time.time() - start:.4f}s")

# NumPy array: fast
np_array = np.arange(1000000)
start = time.time()
result = np_array * 2
print(f"NumPy array: {time.time() - start:.4f}s")
\`\`\`

NumPy is fast because:
- Data is stored in contiguous memory
- Operations run in compiled C code
- No type checking on every element
            `,
            codeExample: {
              title: 'Creating NumPy Arrays',
              code: `import numpy as np

# From list
arr1 = np.array([1, 2, 3, 4, 5])
print(f"1D Array: {arr1}")

# 2D array (matrix)
arr2 = np.array([[1, 2, 3], [4, 5, 6]])
print(f"2D Array:\\n{arr2}")

# Special arrays
zeros = np.zeros(5)
ones = np.ones((2, 3))
identity = np.eye(3)
range_arr = np.arange(0, 10, 2)
linspace = np.linspace(0, 1, 5)

print(f"Zeros: {zeros}")
print(f"Ones:\\n{ones}")
print(f"Identity:\\n{identity}")
print(f"Range: {range_arr}")
print(f"Linspace: {linspace}")`,
              output: `1D Array: [1 2 3 4 5]
2D Array:
[[1 2 3]
 [4 5 6]]
Zeros: [0. 0. 0. 0. 0.]
Ones:
[[1. 1. 1.]
 [1. 1. 1.]]
Identity:
[[1. 0. 0.]
 [0. 1. 0.]
 [0. 0. 1.]]
Range: [0 2 4 6 8]
Linspace: [0.   0.25 0.5  0.75 1.  ]`
            }
          },
          {
            id: 'array-operations',
            title: 'Array Operations',
            content: `
## Array Operations

NumPy lets you do math on entire arrays without loops (vectorization).

### Element-wise Operations
\`\`\`python
import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

print(a + b)    # [5, 7, 9]  (element-wise add)
print(a * b)    # [4, 10, 18] (element-wise multiply)
print(a ** 2)   # [1, 4, 9]  (square each element)
print(a / b)    # [0.25, 0.4, 0.5]
\`\`\`

### Broadcasting
\`\`\`python
# Add a scalar to all elements
arr = np.array([1, 2, 3])
print(arr + 10)  # [11, 12, 13]

# Multiply all elements
print(arr * 3)   # [3, 6, 9]
\`\`\`

### Aggregation Functions
\`\`\`python
arr = np.array([10, 20, 30, 40, 50])

print(arr.mean())   # 30.0 (average)
print(arr.sum())    # 150 (total)
print(arr.min())    # 10 (smallest)
print(arr.max())    # 50 (largest)
print(arr.std())    # 14.14 (standard deviation)
\`\`\`
            `,
            codeExample: {
              title: 'Array Operations',
              code: `import numpy as np

# Create arrays
a = np.array([1, 2, 3, 4, 5])
b = np.array([10, 20, 30, 40, 50])

# Element-wise operations
print("a + b =", a + b)
print("a * b =", a * b)
print("a ** 2 =", a ** 2)

# Aggregation
print(f"Mean: {a.mean()}")
print(f"Sum: {a.sum()}")
print(f"Min: {a.min()}")
print(f"Max: {a.max()}")
print(f"Std: {a.std():.2f}")

# 2D array operations
matrix = np.array([[1, 2], [3, 4]])
print(f"\\nMatrix:\\n{matrix}")
print(f"Sum of all: {matrix.sum()}")
print(f"Mean of rows: {matrix.mean(axis=1)}")
print(f"Mean of cols: {matrix.mean(axis=0)}")`,
              output: `a + b = [11 22 33 44 55]
a * b = [ 10  40  90 160 250]
a ** 2 = [ 1  4  9 16 25]
Mean: 3.0
Sum: 15
Min: 1
Max: 5
Std: 1.41

Matrix:
[[1 2]
 [3 4]]
Sum of all: 10
Mean of rows: [1.5 3.5]
Mean of cols: [2. 3.]`
            }
          }
        ],
        quiz: {
          title: 'NumPy Quiz',
          questions: [
            {
              question: 'Why is NumPy faster than Python lists?',
              options: ['It uses less memory', 'Operations run in compiled C', 'It has fewer features', 'It uses Python loops'],
              correct: 1,
              explanation: 'NumPy operations are implemented in C, avoiding Python loop overhead and type checking.'
            },
            {
              question: 'What does `np.zeros(3)` create?',
              options: ['3 zeros', '[0, 0, 0]', '[0.0, 0.0, 0.0]', 'All of the above'],
              correct: 3,
              explanation: 'np.zeros(3) creates a 1D array of 3 zeros: [0., 0., 0.] (float type by default).'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'dsa-arrays-strings',
    title: 'DSA: Arrays & Strings',
    icon: '📦',
    description: 'Master arrays, strings, and essential coding patterns',
    color: '#e74c3c',
    modules: [
      {
        id: 'time-complexity',
        title: 'Time & Space Complexity',
        lessons: [
          {
            id: 'big-o-notation',
            title: 'Big O Notation',
            content: `
## Big O Notation

Big O tells you **how fast** your algorithm scales as input grows. Interviewers ask this to test if you understand efficiency.

### Common Complexities (Best → Worst)

| Big O | Name | Example | Speed |
|-------|------|---------|-------|
| \`O(1)\` | Constant | Array access by index | ⚡ Fastest |
| \`O(log n)\` | Logarithmic | Binary search | ⚡ Fast |
| \`O(n)\` | Linear | Loop through array | 🔵 OK |
| \`O(n log n)\` | Linearithmic | Merge sort | 🟡 Medium |
| \`O(n²)\` | Quadratic | Nested loops | 🟠 Slow |
| \`O(2ⁿ)\` | Exponential | Fibonacci (recursive) | 🔴 Very slow |

### How to Calculate Big O

\`\`\`python
# O(1) - Constant time
def get_first(arr):
    return arr[0]

# O(n) - Linear time
def find_max(arr):
    max_val = arr[0]
    for num in arr:        # loops n times
        if num > max_val:
            max_val = num
    return max_val

# O(n²) - Quadratic time
def has_duplicate(arr):
    for i in range(len(arr)):
        for j in range(i+1, len(arr)):  # nested loop
            if arr[i] == arr[j]:
                return True
    return False
\`\`\`

### Rules for Big O
1. **Drop constants**: O(2n) → O(n)
2. **Drop lower terms**: O(n² + n) → O(n²)
3. **Different inputs = different variables**: O(a + b), not O(n)
4. **Best case ≠ Worst case**: Always analyze worst case
            `,
            codeExample: {
              title: 'Big O Examples',
              code: `# O(1) - Constant
def get_element(arr, i):
    return arr[i]

# O(n) - Linear
def linear_search(arr, target):
    for item in arr:
        if item == target:
            return True
    return False

# O(log n) - Logarithmic (Binary Search)
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# O(n^2) - Quadratic
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

print("O(1):", get_element([1,2,3], 1))
print("O(n):", linear_search([1,2,3,4,5], 3))
print("O(log n):", binary_search([1,2,3,4,5], 3))
print("O(n^2):", bubble_sort([5,3,1,4,2]))`,
              output: `O(1): 2
O(n): True
O(log n): 2
O(n^2): [1, 2, 3, 4, 5]`
            }
          },
          {
            id: 'space-complexity',
            title: 'Space Complexity',
            content: `
## Space Complexity

Space complexity measures **how much memory** your algorithm uses.

### Common Space Complexities

| Big O | Space Used | Example |
|-------|-----------|---------|
| \`O(1)\` | Fixed | Swap variables |
| \`O(n)\` | Proportional to input | Copying an array |
| \`O(n²)\` | Quadratic | 2D matrix |

### Examples

\`\`\`python
# O(1) space - only uses a few variables
def sum_array(arr):
    total = 0
    for num in arr:
        total += num
    return total

# O(n) space - creates new array
def double_array(arr):
    return [x * 2 for x in arr]

# O(n) space - uses hash set
def has_duplicates(arr):
    seen = set()        # can grow up to size n
    for num in arr:
        if num in seen:
            return True
        seen.add(num)
    return False
\`\`\`
            `,
            codeExample: {
              title: 'Space Complexity Examples',
              code: `# O(1) space
def swap(arr, i, j):
    arr[i], arr[j] = arr[j], arr[i]

# O(n) space
def create_copy(arr):
    return arr[:]

# O(n) space - using extra data structure
def count_elements(arr):
    counts = {}
    for num in arr:
        counts[num] = counts.get(num, 0) + 1
    return counts

print("O(1) space: swap works in-place")
print("O(n) space:", create_copy([1,2,3]))
print("O(n) space:", count_elements([1,1,2,3,3,3]))`,
              output: `O(1) space: swap works in-place
O(n) space: [1, 2, 3]
O(n) space: {1: 2, 2: 1, 3: 3}`
            }
          }
        ],
        quiz: {
          title: 'Time & Space Complexity Quiz',
          questions: [
            {
              question: 'What is the Big O of binary search?',
              options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
              correct: 1,
              explanation: 'Binary search halves the search space each step, so it takes log n steps.'
            },
            {
              question: 'What is the Big O of checking every pair in an array?',
              options: ['O(n)', 'O(log n)', 'O(n²)', 'O(n log n)'],
              correct: 2,
              explanation: 'Nested loops iterating through all pairs is O(n²).'
            },
            {
              question: 'O(2n) simplifies to:',
              options: ['O(2n)', 'O(n²)', 'O(n)', 'O(2)'],
              correct: 2,
              explanation: 'We drop constants: O(2n) → O(n).'
            }
          ]
        }
      },
      {
        id: 'arrays',
        title: 'Arrays & Strings',
        lessons: [
          {
            id: 'array-basics',
            title: 'Array Fundamentals',
            content: `
## Arrays (Lists in Python)

An array stores elements in **contiguous memory**. In Python, we use **lists**.

### Key Operations & Time Complexity

| Operation | Time | Why |
|-----------|------|-----|
| Access by index | O(1) | Direct memory access |
| Search (unsorted) | O(n) | Must check each element |
| Insert at end | O(1)* | *Amortized |
| Insert at beginning | O(n) | Must shift all elements |
| Delete at end | O(1) | Just remove last |
| Delete at beginning | O(n) | Must shift all elements |

### Python Array Techniques

\`\`\`python
# Sliding Window
def max_subarray_sum(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i-k]
        max_sum = max(max_sum, window_sum)
    return max_sum

# Two Pointers
def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        curr_sum = arr[left] + arr[right]
        if curr_sum == target:
            return [left, right]
        elif curr_sum < target:
            left += 1
        else:
            right -= 1
    return []
\`\`\`
            `,
            codeExample: {
              title: 'Array Patterns',
              code: `# Two Sum (Hash Map approach) - O(n)
def two_sum(arr, target):
    seen = {}
    for i, num in enumerate(arr):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Sliding Window - Maximum sum of k elements
def max_sum_k(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i-k]
        max_sum = max(max_sum, window_sum)
    return max_sum

# Kadane's Algorithm - Maximum subarray sum
def max_subarray(arr):
    max_sum = arr[0]
    current_sum = arr[0]
    for i in range(1, len(arr)):
        current_sum = max(arr[i], current_sum + arr[i])
        max_sum = max(max_sum, current_sum)
    return max_sum

print("Two Sum:", two_sum([2,7,11,15], 9))
print("Max Sum K=3:", max_sum_k([1,4,2,10,2,3,1,0,20], 3))
print("Kadane's:", max_subarray([-2,1,-3,4,-1,2,1,-5,4]))`,
              output: `Two Sum: [0, 1]
Max Sum K=3: 23
Kadane's: 6`
            }
          },
          {
            id: 'string-manipulation',
            title: 'String Manipulation',
            content: `
## String Manipulation

Strings are **immutable** in Python. Every "modification" creates a new string.

### Common String Patterns

\`\`\`python
# Check palindrome
def is_palindrome(s):
    return s == s[::-1]

# Count vowels
def count_vowels(s):
    return sum(1 for c in s.lower() if c in 'aeiou')

# Reverse words
def reverse_words(s):
    return ' '.join(s.split()[::-1])

# Valid anagram
def is_anagram(s1, s2):
    return sorted(s1.lower()) == sorted(s2.lower())
\`\`\`

### String + Hash Map Pattern
\`\`\`python
from collections import Counter

def first_unique_char(s):
    count = Counter(s)
    for i, char in enumerate(s):
        if count[char] == 1:
            return i
    return -1
\`\`\`
            `,
            codeExample: {
              title: 'String Problems',
              code: `# Palindrome check
def is_palindrome(s):
    s = ''.join(c.lower() for c in s if c.isalnum())
    return s == s[::-1]

# Longest substring without repeating
def length_of_longest_substring(s):
    char_set = set()
    left = 0
    max_len = 0
    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])
        max_len = max(max_len, right - left + 1)
    return max_len

# Valid palindrome
print("Racecar:", is_palindrome("Racecar"))
print("Hello:", is_palindrome("Hello"))
print("Longest substring:", length_of_longest_substring("abcabcbb"))
print("bbbbb:", length_of_longest_substring("bbbbb"))`,
              output: `Racecar: True
Hello: False
Longest substring: 3
bbbbb: 1`
            }
          }
        ],
        quiz: {
          title: 'Arrays & Strings Quiz',
          questions: [
            {
              question: 'What is the time complexity of checking if an element exists in an unsorted array?',
              options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
              correct: 2,
              explanation: 'You must check each element one by one in an unsorted array.'
            },
            {
              question: 'Which pattern is best for "find two numbers that sum to target" in a sorted array?',
              options: ['Brute force', 'Two Pointers', 'Binary Search', 'Recursion'],
              correct: 1,
              explanation: 'Two Pointers works in O(n) on sorted arrays: move left pointer if sum is too small, right if too large.'
            },
            {
              question: 'What is Kadane\'s Algorithm used for?',
              options: ['Sorting', 'Finding duplicates', 'Maximum subarray sum', 'Binary search'],
              correct: 2,
              explanation: 'Kadane\'s Algorithm finds the maximum sum contiguous subarray in O(n).'
            }
          ]
        }
      },
      {
        id: 'two-pointers',
        title: 'Two Pointers Pattern',
        lessons: [
          {
            id: 'two-pointers-intro',
            title: 'Two Pointers Technique',
            content: `
## Two Pointers Pattern

Use **two pointers** when you need to compare elements from different positions in a sorted or linear structure.

### When to Use
- Array is **sorted** (or can be sorted)
- Need to find **pairs** or **triplets**
- Problem involves **opposite ends** of array

### Template

\`\`\`python
def two_pointers(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        current = calculate(arr[left], arr[right])
        if current == target:
            return result
        elif current < target:
            left += 1    # need bigger
        else:
            right -= 1   # need smaller
    return not_found
\`\`\`
            `,
            codeExample: {
              title: 'Two Pointers Problems',
              code: `# 1. Two Sum (sorted array)
def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        curr = arr[left] + arr[right]
        if curr == target:
            return [left, right]
        elif curr < target:
            left += 1
        else:
            right -= 1
    return []

# 2. Valid Palindrome
def is_palindrome(s):
    s = ''.join(c.lower() for c in s if c.isalnum())
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True

# 3. Container With Most Water
def max_area(height):
    left, right = 0, len(height) - 1
    max_water = 0
    while left < right:
        water = min(height[left], height[right]) * (right - left)
        max_water = max(max_water, water)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_water

print("Two Sum:", two_sum_sorted([1,2,3,4,6], 6))
print("Palindrome:", is_palindrome("racecar"))
print("Max Area:", max_area([1,8,6,2,5,4,8,3,7]))`,
              output: `Two Sum: [1, 2]
Palindrome: True
Max Area: 49`
            }
          }
        ],
        quiz: {
          title: 'Two Pointers Quiz',
          questions: [
            {
              question: 'When should you use Two Pointers?',
              options: ['On unsorted arrays only', 'When array is sorted or needs pair comparison', 'Only for strings', 'Never'],
              correct: 1,
              explanation: 'Two Pointers works best on sorted arrays or when comparing pairs from opposite ends.'
            },
            {
              question: 'In Container With Most Water, why do we move the shorter pointer?',
              options: ['To find smaller area', 'Moving taller pointer cannot increase area', 'Random choice', 'To sort the array'],
              correct: 1,
              explanation: 'The area is limited by the shorter line. Moving the taller one can only decrease width without guaranteeing taller height.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'dsa-linked-lists',
    title: 'DSA: Linked Lists & Stacks',
    icon: '🔗',
    description: 'Master linked lists, stacks, and queues',
    color: '#9b59b6',
    modules: [
      {
        id: 'linked-lists',
        title: 'Linked Lists',
        lessons: [
          {
            id: 'linked-list-basics',
            title: 'Linked List Fundamentals',
            content: `
## Linked Lists

A linked list stores elements in **nodes** where each node points to the next.

### Array vs Linked List

| Feature | Array | Linked List |
|---------|-------|-------------|
| Access by index | O(1) | O(n) |
| Insert at beginning | O(n) | O(1) |
| Insert at end | O(1) | O(1)* |
| Memory | Contiguous | Scattered |
| Cache friendly | Yes | No |

### Node Structure

\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
\`\`\`

### Key Operations
- **Traverse**: Follow \`next\` pointers
- **Insert**: Update pointers
- **Delete**: Bypass the node
- **Reverse**: Reverse all pointers
            `,
            codeExample: {
              title: 'Linked List Implementation',
              code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# Create linked list: 1 -> 2 -> 3
head = ListNode(1)
head.next = ListNode(2)
head.next.next = ListNode(3)

# Traverse and print
def traverse(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result

# Reverse linked list
def reverse_list(head):
    prev = None
    while head:
        next_node = head.next
        head.next = prev
        prev = head
        head = next_node
    return prev

print("Original:", traverse(head))
reversed_head = reverse_list(head)
print("Reversed:", traverse(reversed_head))`,
              output: `Original: [1, 2, 3]
Reversed: [3, 2, 1]`
            }
          },
          {
            id: 'fast-slow-pointers',
            title: 'Fast & Slow Pointers',
            content: `
## Fast & Slow Pointers (Tortoise & Hare)

Use this pattern to detect **cycles** and find **middle** of linked list.

### Cycle Detection (Floyd's Algorithm)
\`\`\`python
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False
\`\`\`

### Find Middle Node
\`\`\`python
def find_middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow  # slow is at middle
\`\`\`
            `,
            codeExample: {
              title: 'Fast & Slow Pointers',
              code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False

def find_middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow

# Create list: 1->2->3->4->5
head = ListNode(1, ListNode(2, ListNode(3, ListNode(4, ListNode(5)))))
print("Has cycle:", has_cycle(head))
print("Middle:", find_middle(head).val)

# Create list with cycle: 1->2->3->2 (cycle)
head2 = ListNode(1)
node2 = ListNode(2)
node3 = ListNode(3)
head2.next = node2
node2.next = node3
node3.next = node2  # cycle!
print("Has cycle:", has_cycle(head2))`,
              output: `Has cycle: False
Middle: 3
Has cycle: True`
            }
          }
        ],
        quiz: {
          title: 'Linked Lists Quiz',
          questions: [
            {
              question: 'What is the time complexity of accessing an element by index in a linked list?',
              options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
              correct: 2,
              explanation: 'You must traverse from the head node, so it takes O(n) time.'
            },
            {
              question: 'In Floyd\'s cycle detection, what happens when fast and slow pointers meet?',
              options: ['No cycle exists', 'A cycle exists', 'List is empty', 'Error occurred'],
              correct: 1,
              explanation: 'If fast and slow meet, there is definitely a cycle in the linked list.'
            }
          ]
        }
      },
      {
        id: 'stacks-queues',
        title: 'Stacks & Queues',
        lessons: [
          {
            id: 'stack-fundamentals',
            title: 'Stack (LIFO)',
            content: `
## Stack - Last In, First Out

Think of a **stack of plates** — you add/remove from the top.

### Operations

| Operation | Time | Python |
|-----------|------|--------|
| Push | O(1) | \`list.append()\` |
| Pop | O(1) | \`list.pop()\` |
| Peek | O(1) | \`list[-1]\` |
| isEmpty | O(1) | \`len(list) == 0\` |

### Common Problems
- Valid Parentheses
- Min Stack
- Evaluate Expression
- Next Greater Element
            `,
            codeExample: {
              title: 'Stack Problems',
              code: `# Valid Parentheses
def is_valid_parentheses(s):
    stack = []
    mapping = {')': '(', ']': '[', '}': '{'}
    
    for char in s:
        if char in mapping:
            if not stack or stack[-1] != mapping[char]:
                return False
            stack.pop()
        else:
            stack.append(char)
    
    return len(stack) == 0

# Min Stack
class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []
    
    def push(self, val):
        self.stack.append(val)
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)
    
    def pop(self):
        if self.stack.pop() == self.min_stack[-1]:
            self.min_stack.pop()
    
    def get_min(self):
        return self.min_stack[-1]

print("Valid ():", is_valid_parentheses("()[]{}"))
print("Invalid (:", is_valid_parentheses("(]"))

ms = MinStack()
ms.push(3)
ms.push(1)
ms.push(4)
print("Min:", ms.get_min())
ms.pop()
print("Min after pop:", ms.get_min())`,
              output: `Valid (): True
Invalid (: False
Min: 1
Min after pop: 1`
            }
          }
        ],
        quiz: {
          title: 'Stacks & Queues Quiz',
          questions: [
            {
              question: 'What data structure does a stack follow?',
              options: ['FIFO', 'LIFO', 'Random access', 'Priority'],
              correct: 1,
              explanation: 'Stack follows Last In, First Out (LIFO) — the last element added is the first removed.'
            },
            {
              question: 'Which problem is a classic stack application?',
              options: ['Finding max in array', 'Valid Parentheses', 'Sorting', 'Binary search'],
              correct: 1,
              explanation: 'Valid Parentheses is solved by pushing opening brackets and popping when closing brackets match.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'dsa-trees',
    title: 'DSA: Trees & Graphs',
    icon: '🌳',
    description: 'Master binary trees, BSTs, and graph algorithms',
    color: '#27ae60',
    modules: [
      {
        id: 'binary-trees',
        title: 'Binary Trees',
        lessons: [
          {
            id: 'tree-traversal',
            title: 'Tree Traversals (DFS & BFS)',
            content: `
## Tree Traversals

### Depth-First Search (DFS)
Goes **deep** before going **wide**.

\`\`\`python
# Inorder: Left → Root → Right (sorted for BST)
def inorder(root):
    if not root:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)

# Preorder: Root → Left → Right
def preorder(root):
    if not root:
        return []
    return [root.val] + preorder(root.left) + preorder(root.right)

# Postorder: Left → Right → Root
def postorder(root):
    if not root:
        return []
    return postorder(root.left) + postorder(root.right) + [root.val]
\`\`\`

### Breadth-First Search (BFS)
Goes **wide** before going **deep** (level by level).

\`\`\`python
from collections import deque

def bfs(root):
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        node = queue.popleft()
        result.append(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return result
\`\`\`
            `,
            codeExample: {
              title: 'Tree Traversal Examples',
              code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# Build tree:    1
#               / \\
#              2   3
#             / \\
#            4   5
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
root.left.left = TreeNode(4)
root.left.right = TreeNode(5)

def inorder(root):
    if not root:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)

def bfs(root):
    if not root:
        return []
    result, queue = [], [root]
    while queue:
        node = queue.pop(0)
        result.append(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return result

def tree_height(root):
    if not root:
        return 0
    return 1 + max(tree_height(root.left), tree_height(root.right))

print("Inorder:", inorder(root))
print("BFS:", bfs(root))
print("Height:", tree_height(root))`,
              output: `Inorder: [4, 2, 5, 1, 3]
BFS: [1, 2, 3, 4, 5]
Height: 3`
            }
          }
        ],
        quiz: {
          title: 'Trees Quiz',
          questions: [
            {
              question: 'What is the inorder traversal of a BST?',
              options: ['Random order', 'Sorted order', 'Reverse sorted', 'Level by level'],
              correct: 1,
              explanation: 'Inorder (Left → Root → Right) gives sorted order for BSTs.'
            },
            {
              question: 'Which traversal uses a queue?',
              options: ['DFS', 'BFS', 'Inorder', 'Preorder'],
              correct: 1,
              explanation: 'BFS (level-order) uses a queue to visit nodes level by level.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'dsa-dynamic-programming',
    title: 'DSA: Dynamic Programming',
    icon: '🧠',
    description: 'Master DP patterns for coding interviews',
    color: '#f39c12',
    modules: [
      {
        id: 'dp-basics',
        title: 'DP Fundamentals',
        lessons: [
          {
            id: 'what-is-dp',
            title: 'What is Dynamic Programming?',
            content: `
## Dynamic Programming (DP)

DP solves problems by breaking them into **overlapping subproblems** and storing results.

### When to Use DP
1. Problem has **overlapping subproblems** (same calculation repeated)
2. Problem has **optimal substructure** (optimal solution contains optimal sub-solutions)

### Two Approaches

**Top-Down (Memoization)** — Recursion + Cache
\`\`\`python
def fib(n, memo={}):
    if n <= 1:
        return n
    if n not in memo:
        memo[n] = fib(n-1) + fib(n-2)
    return memo[n]
\`\`\`

**Bottom-Up (Tabulation)** — Fill table iteratively
\`\`\`python
def fib(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]
\`\`\`
            `,
            codeExample: {
              title: 'Classic DP Problems',
              code: `# 1. Fibonacci (Memoization)
def fib_memo(n, memo={}):
    if n <= 1:
        return n
    if n not in memo:
        memo[n] = fib_memo(n-1) + fib_memo(n-2)
    return memo[n]

# 2. Climbing Stairs
def climb_stairs(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1], dp[2] = 1, 2
    for i in range(3, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]

# 3. Coin Change
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for i in range(coin, amount + 1):
            dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

# 4. 0/1 Knapsack
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(1, capacity + 1):
            if weights[i-1] <= w:
                dp[i][w] = max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1])
            else:
                dp[i][w] = dp[i-1][w]
    return dp[n][capacity]

print("Fib(10):", fib_memo(10))
print("Climb 5:", climb_stairs(5))
print("Coin Change:", coin_change([1,5,10,25], 30))
print("Knapsack:", knapsack([2,3,4,5], [3,4,5,6], 5))`,
              output: `Fib(10): 55
Climb 5: 8
Coin Change: 2
Knapsack: 7`
            }
          }
        ],
        quiz: {
          title: 'Dynamic Programming Quiz',
          questions: [
            {
              question: 'What are the two key properties for using DP?',
              options: ['Speed and accuracy', 'Overlapping subproblems and optimal substructure', 'Recursion and iteration', 'Stacks and queues'],
              correct: 1,
              explanation: 'DP requires overlapping subproblems (same work repeated) and optimal substructure (optimal solution contains optimal sub-solutions).'
            },
            {
              question: 'What is the difference between top-down and bottom-up DP?',
              options: ['No difference', 'Top-down uses memoization, bottom-up uses tabulation', 'Top-down is slower', 'Bottom-up uses recursion'],
              correct: 1,
              explanation: 'Top-down (memoization) starts from the main problem and caches results. Bottom-up (tabulation) builds the solution from smallest subproblems.'
            }
          ]
        }
      }
    ]
  }
];

export default courses;
