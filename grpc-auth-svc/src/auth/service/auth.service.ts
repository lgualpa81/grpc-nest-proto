import { InjectRepository } from "@nestjs/typeorm";
import { Auth } from "../auth.entity";
import { Repository } from "typeorm";
import { JwtService } from "./jwt.service";
import { HttpStatus, Inject } from "@nestjs/common";
import { RegisterRequestDto, ValidateRequestDto } from "../auth.dto";
import { LoginResponse, RegisterResponse, ValidateResponse } from "../auth.pb";

export class AuthService {
  @InjectRepository(Auth)
  private readonly repository: Repository<Auth>

  @Inject(JwtService)
  private readonly jwtService: JwtService

  public async register({ email, password }: RegisterRequestDto): Promise<RegisterResponse> {
    let auth: Auth = await this.repository.findOne({ where: { email } })
    if (auth) return { status: HttpStatus.CONFLICT, error: ['Email already exists'] }

    auth = new Auth()
    auth.email = email
    auth.password = this.jwtService.encodePassword(password)

    await this.repository.save(auth)

    return { status: HttpStatus.CREATED, error: null }
  }

  public async login({ email, password }: RegisterRequestDto): Promise<LoginResponse> {
    const auth: Auth = await this.repository.findOne({ where: { email } })
    if (!auth || !this.jwtService.isPasswordValid(password, auth.password)) {
      return { status: HttpStatus.UNAUTHORIZED, error: ['Invalid credentials'], token: null };
    }

    const token: string = this.jwtService.generateToken(auth)
    return { token, status: HttpStatus.OK, error: null }
  }

  public async validate({ token }: ValidateRequestDto): Promise<ValidateResponse> {
    const decoded: Auth = await this.jwtService.verify(token)
    if (!decoded) return { status: HttpStatus.FORBIDDEN, error: ['Token is not valid'], userId: null }

    const auth: Auth = await this.jwtService.validateUser(decoded)

    if (!auth) return { status: HttpStatus.CONFLICT, error: ['User not found'], userId: null }
    return { status: HttpStatus.OK, error: null, userId: decoded.id }
  }
}