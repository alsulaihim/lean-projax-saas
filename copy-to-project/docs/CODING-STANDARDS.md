# Coding Standards

> Non-negotiable rules for code quality and consistency

---

## 🎯 Core Principles

1. **Readability First** - Code is read 10x more than written
2. **Explicit Over Implicit** - Clear intent beats clever tricks
3. **Consistency** - Follow patterns, don't invent new ones
4. **DRY (Don't Repeat Yourself)** - But not at the cost of clarity
5. **YAGNI (You Aren't Gonna Need It)** - Build what's needed now

---

## 📝 General Rules

### File Organization

- One component/class per file
- Max file length: 300 lines (break up if longer)
- Group related files in feature folders
- Use index files for clean exports

### Naming Conventions

```typescript
// Files
my - component.tsx // Components (kebab-case)
useMyHook.ts // Hooks (camelCase with 'use' prefix)
my - service.ts // Services (kebab-case)
MyType.ts // Types/Interfaces (PascalCase)

// Variables & Functions
const userName = '...' // camelCase
const API_BASE_URL = '...' // SCREAMING_SNAKE_CASE for constants
function getUserData() {} // camelCase
class UserService {} // PascalCase

// Components
function UserProfile() {} // PascalCase
const LoadingSpinner = () => {} // PascalCase

// Types & Interfaces
interface User {} // PascalCase
type UserRole = '...' // PascalCase
```

### Comments

```typescript
// ✅ GOOD - Explains WHY
// Using debounce to prevent API spam during rapid typing
const debouncedSearch = debounce(search, 300)

// ❌ BAD - Explains WHAT (code should be self-explanatory)
// Set the user name
const userName = 'John'

// ✅ GOOD - JSDoc for public APIs
/**
 * Fetches user data from the API
 * @param userId - The unique user identifier
 * @returns Promise with user data
 * @throws {ApiError} When user not found
 */
async function getUser(userId: string): Promise<User> {}
```

---

## 🎨 Frontend Standards (Next.js + React)

### Component Structure

```typescript
// ✅ Preferred structure
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEdit = () => {
    onEdit?.(user.id);
  };

  return (
    <div className="...">
      {/* Component JSX */}
    </div>
  );
}
```

### React Best Practices

```typescript
// ✅ GOOD - Destructure props
function UserProfile({ name, email }: UserProfileProps) {}

// ❌ BAD - Using props object
function UserProfile(props) {
  return <div>{props.name}</div>;
}

// ✅ GOOD - Early returns for conditionals
if (!user) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <UserProfile user={user} />;

// ❌ BAD - Nested ternaries
return user ? (error ? <Error /> : <Profile />) : <Loading />;

// ✅ GOOD - Extract complex logic to hooks
const { isLoading, data, error } = useUserData(userId);

// ❌ BAD - Complex logic in component
const [data, setData] = useState();
useEffect(() => {
  // 50 lines of fetching logic...
}, []);
```

### State Management

```typescript
// ✅ Local state for component-specific data
const [isOpen, setIsOpen] = useState(false)

// ✅ Context for shared UI state (theme, modals)
const { theme, setTheme } = useTheme()

// ✅ Server state for API data (React Query, SWR)
const { data, isLoading } = useQuery(['users'], fetchUsers)

// ❌ Avoid prop drilling beyond 2 levels - use Context
```

### Styling (Tailwind + shadcn/ui)

```typescript
// ✅ GOOD - Use shadcn components
import { Button } from '@/components/ui/button';
<Button variant="outline">Click Me</Button>

// ✅ GOOD - Tailwind for custom styles
<div className="flex items-center gap-4 p-6">

// ✅ GOOD - Use cn() for conditional classes
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}>

// ❌ BAD - Inline styles (avoid unless absolutely necessary)
<div style={{ marginTop: '20px' }}>
```

---

## 🔧 Backend Standards (NestJS)

### Module Structure

```
src/
├── modules/
│   ├── users/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── users.repository.ts
```

### Controller Standards

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: [User] })
  async findAll(@Query() query: FindUsersDto): Promise<User[]> {
    return this.usersService.findAll(query)
  }

  @Post()
  @HttpCode(201)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto)
  }
}
```

### Service Standards

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return user
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    })

    return this.userRepository.save(user)
  }
}
```

### Error Handling

```typescript
// ✅ Use NestJS exceptions
throw new NotFoundException('User not found')
throw new BadRequestException('Invalid input')
throw new UnauthorizedException('Invalid credentials')

// ✅ Custom exceptions for domain errors
export class UserAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super(`User with email ${email} already exists`)
  }
}

// ✅ Global exception filter for unexpected errors
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Log error
    // Return sanitized response
  }
}
```

---

## 📊 Database Standards

### Entity Definitions

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt?: Date // Soft delete
}
```

### Query Best Practices

```typescript
// ✅ GOOD - Use query builder for complex queries
const users = await this.userRepository
  .createQueryBuilder('user')
  .where('user.active = :active', { active: true })
  .andWhere('user.createdAt > :date', { date: lastMonth })
  .select(['user.id', 'user.email']) // Select only needed fields
  .take(10)
  .getMany()

// ✅ GOOD - Use transactions for related operations
await this.dataSource.transaction(async manager => {
  await manager.save(user)
  await manager.save(profile)
})

// ❌ BAD - N+1 queries
const users = await this.userRepository.find()
for (const user of users) {
  user.posts = await this.postRepository.find({ where: { userId: user.id } })
}

// ✅ GOOD - Use eager loading
const users = await this.userRepository.find({
  relations: ['posts'],
})
```

---

## 🔒 Security Standards

### Input Validation

```typescript
// ✅ ALWAYS validate with class-validator
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string
}

// ✅ Sanitize user input
import { escape } from 'lodash'
const sanitized = escape(userInput)
```

### Authentication

```typescript
// ✅ Hash passwords with bcrypt (10 rounds minimum)
const hashedPassword = await bcrypt.hash(password, 10)

// ✅ Use JWT with short expiration
const token = this.jwtService.sign(payload, { expiresIn: '15m' })

// ✅ Store refresh tokens securely
// ❌ Never store passwords in plain text
// ❌ Never log sensitive data
```

---

## 🧪 Testing Standards

### Test Structure

```typescript
describe('UserService', () => {
  let service: UserService
  let repository: Repository<User>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
  })

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const user = { id: '1', email: 'test@example.com' }
      jest.spyOn(repository, 'findOne').mockResolvedValue(user)

      expect(await service.findOne('1')).toEqual(user)
    })

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null)

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException)
    })
  })
})
```

### Test Coverage Requirements

- **Unit Tests:** 80% minimum coverage
- **Integration Tests:** Critical paths only
- **E2E Tests:** User flows and API endpoints

---

## 🚫 Common Anti-Patterns to Avoid

### General

```typescript
// ❌ Magic numbers
if (users.length > 50) {
}
// ✅ Named constants
const MAX_USERS_PER_PAGE = 50
if (users.length > MAX_USERS_PER_PAGE) {
}

// ❌ God classes (classes that do everything)
// ✅ Single Responsibility Principle

// ❌ Callback hell
getData(data => {
  processData(data, result => {
    saveResult(result, saved => {})
  })
})
// ✅ async/await
const data = await getData()
const result = await processData(data)
await saveResult(result)
```

### React

```typescript
// ❌ Mutating state directly
user.name = 'John';
setUser(user);
// ✅ Create new object
setUser({ ...user, name: 'John' });

// ❌ Forgetting dependencies in useEffect
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency
// ✅ Include all dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ Using indexes as keys
{items.map((item, index) => <div key={index}>{item}</div>)}
// ✅ Use stable unique identifiers
{items.map((item) => <div key={item.id}>{item}</div>)}
```

---

## 🔍 Code Review Checklist

Before submitting code, verify:

- [ ] Follows naming conventions
- [ ] No console.logs or debugger statements
- [ ] Proper error handling
- [ ] Input validation on all user inputs
- [ ] Tests written and passing
- [ ] No TypeScript `any` types (use `unknown` if needed)
- [ ] No hardcoded values (use constants/config)
- [ ] Comments explain WHY, not WHAT
- [ ] No unused imports or variables
- [ ] Consistent formatting (Prettier)

---

## 📚 Tools & Configuration

### Required Tools

- **ESLint** - Linting
- **Prettier** - Formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

---

**Remember:** These standards exist to maintain code quality and team velocity. When in doubt, ask for clarification!

---

[END OF CODING-STANDARDS.md]
