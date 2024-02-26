import { Controller, Get, Inject, Param } from "@nestjs/common";

@Controller("/")
export class AppController {
  @Get("")
  async healthCheck() {
    return {
      status: "OK",
      timeelapsed: new Date(),
    };
  }
}
