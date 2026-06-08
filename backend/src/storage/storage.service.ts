import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
    this.bucket = process.env.SUPABASE_BUCKET ?? 'profile-images';
  }

  async subirImagenPerfil(
    archivo: Express.Multer.File,
    nombreUsuario: string,
  ): Promise<string> {
    const extension =
      archivo.originalname.split('.').pop()?.toLowerCase() ?? 'jpg';
    const ruta = `${nombreUsuario}-${Date.now()}.${extension}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(ruta, archivo.buffer, {
        contentType: archivo.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo subir la imagen de perfil.',
      );
    }

    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(ruta);

    return data.publicUrl;
  }
}