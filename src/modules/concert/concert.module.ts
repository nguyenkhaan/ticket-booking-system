import { Module } from "@nestjs/common";
import { ConcertService } from "./concert.service";
import { ConcertController } from "./concert.controller";

@Module({
    controllers: [ConcertController], 
    providers: [ConcertService], 
    exports: [ConcertService]
}) 
export class ConcertModule { }