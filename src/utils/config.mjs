/**
 * Environment configuration utility
 * Provides centralized access to environment variables and stage-specific settings
 */

export const config = {
  stage: process.env.STAGE || 'local',
  logLevel: process.env.LOG_LEVEL || 'INFO',
  bucketName: process.env.BUCKET_NAME || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
  
  isLocal: () => config.stage === 'local',
  isTest: () => config.stage === 'test',
  isProd: () => config.stage === 'prod',
  
  /**
   * Logs message based on configured log level
   * @param {string} level - Log level (DEBUG, INFO, ERROR)
   * @param {string} message - Message to log
   * @param {object} data - Optional data object
   */
  log: (level, message, data = {}) => {
    const levels = { DEBUG: 0, INFO: 1, ERROR: 2 };
    const currentLevel = levels[config.logLevel] || 1;
    const messageLevel = levels[level] || 1;
    
    if (messageLevel >= currentLevel) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        stage: config.stage,
        message,
        ...data
      }));
    }
  }
};

export default config;
