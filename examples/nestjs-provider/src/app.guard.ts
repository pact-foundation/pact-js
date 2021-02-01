import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  BadGatewayException,
  CallHandler,
  UnauthorizedException,
} from "@nestjs/common"
import { Observable, throwError } from "rxjs"
import { Request } from "express"

@Injectable()
export class AppInterceptor implements NestInterceptor {
  public intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>()

    const { headers } = request
    const { authorization: token = "" } = headers

    if (token !== "Bearer 1234") {
      return throwError(new UnauthorizedException())
    }

    return next.handle()
  }
}
