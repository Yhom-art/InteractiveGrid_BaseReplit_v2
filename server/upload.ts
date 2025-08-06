import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import multer from 'multer';

// Configuration de Multer pour gérer les uploads de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Utiliser directement le dossier Yhom_Doublures
    const uploadDir = path.join(process.cwd(), 'attached_assets', 'Yhom_Doublures');
    
    console.log(`📁 Tentative de création du dossier: ${uploadDir}`);
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`✅ Dossier créé: ${uploadDir}`);
      } catch (error) {
        console.error(`❌ Erreur lors de la création du dossier: ${error}`);
        return cb(error as Error, uploadDir);
      }
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique basé sur le nom original
    const originalName = file.originalname;
    const timestamp = Date.now();
    const extension = path.extname(originalName);
    const basename = path.basename(originalName, extension);
    
    const finalName = `${basename}_${timestamp}${extension}`;
    console.log(`📄 Nom de fichier généré: ${finalName}`);
    
    cb(null, finalName);
  }
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log(`🔍 Vérification du type de fichier: ${file.mimetype} pour ${file.originalname}`);
  
  // Accepter les images et les fichiers audio
  if (file.mimetype.startsWith('image/') || 
      file.mimetype.startsWith('audio/') ||
      file.mimetype === 'audio/mpeg' ||
      file.mimetype === 'audio/mp3' ||
      file.mimetype === 'audio/wav' ||
      file.mimetype === 'audio/ogg') {
    console.log(`✅ Fichier accepté: ${file.mimetype}`);
    cb(null, true);
  } else {
    console.log(`❌ Fichier rejeté: ${file.mimetype}`);
    cb(new Error(`Type de fichier non supporté: ${file.mimetype}. Seules les images et fichiers audio sont acceptés.`));
  }
};

// Configurer l'upload avec une limite de taille
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max pour les fichiers audio
  }
});

// Middleware pour gérer les erreurs d'upload
export function handleUploadErrors(err: any, req: Request, res: Response, next: Function) {
  if (err instanceof multer.MulterError) {
    // Erreur Multer (ex: limite de taille dépassée)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: true, 
        message: 'Le fichier est trop volumineux. La taille maximale est de 15MB.'
      });
    }
    
    return res.status(400).json({ 
      error: true, 
      message: `Erreur d'upload: ${err.message}`
    });
  } else if (err) {
    // Autres erreurs
    return res.status(500).json({ 
      error: true, 
      message: err.message
    });
  }
  
  next();
}

// Gestionnaire de route pour l'upload de fichiers
export async function uploadFileHandler(req: Request, res: Response) {
  try {
    console.log('🔄 Traitement de l\'upload de fichier...');
    
    // L'upload a déjà été traité par le middleware multer
    if (!req.file) {
      console.log('❌ Aucun fichier reçu');
      return res.status(400).json({ 
        error: true, 
        message: 'Aucun fichier reçu.'
      });
    }
    
    console.log('📋 Détails du fichier uploadé:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size
    });
    
    // Le fichier est déjà dans le bon dossier grâce à la configuration multer
    const relativePath = req.file.path.replace(process.cwd() + '/', '');
    // Créer l'URL accessible pour le frontend
    const publicUrl = '/' + relativePath;
    
    console.log('✅ Fichier sauvegardé avec succès:', relativePath);
    console.log('🔗 URL publique:', publicUrl);
    
    // Retourner le chemin du fichier
    return res.status(200).json({
      success: true,
      message: 'Fichier téléchargé avec succès',
      url: publicUrl,
      filePath: relativePath,
      fileName: req.file.filename,
      size: req.file.size
    });
  } catch (error: any) {
    console.error('❌ Erreur lors du traitement du fichier:', error);
    return res.status(500).json({ 
      error: true, 
      message: `Erreur serveur: ${error.message}`
    });
  }
}

// Middleware d'upload à utiliser dans les routes
export const uploadMiddleware = upload.single('file');