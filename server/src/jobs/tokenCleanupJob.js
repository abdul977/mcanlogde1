import cron from 'node-cron';
import RefreshToken from '../models/RefreshToken.js';

/**
 * Token Cleanup Job
 * Runs every hour to clean up expired and revoked refresh tokens
 */
class TokenCleanupJob {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.stats = {
      totalRuns: 0,
      tokensCleanedUp: 0,
      lastCleanupCount: 0,
      errors: 0
    };
  }

  /**
   * Start the cleanup job
   */
  start() {
    console.log('🧹 Starting token cleanup job...');
    
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
      await this.runCleanup();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    // Also run immediately on startup
    setTimeout(() => this.runCleanup(), 5000);
  }

  /**
   * Run the cleanup process
   */
  async runCleanup() {
    if (this.isRunning) {
      console.log('⚠️ Token cleanup already running, skipping...');
      return;
    }

    this.isRunning = true;
    this.lastRun = new Date();
    this.stats.totalRuns++;

    try {
      console.log('🧹 Starting token cleanup process...');
      
      // Clean up expired tokens
      const expiredCount = await RefreshToken.cleanupExpiredTokens();
      
      // Clean up old revoked tokens (older than 30 days)
      const oldRevokedCount = await this.cleanupOldRevokedTokens();
      
      // Clean up orphaned tokens (users that no longer exist)
      const orphanedCount = await this.cleanupOrphanedTokens();
      
      const totalCleaned = expiredCount + oldRevokedCount + orphanedCount;
      
      this.stats.tokensCleanedUp += totalCleaned;
      this.stats.lastCleanupCount = totalCleaned;
      
      if (totalCleaned > 0) {
        console.log(`✅ Token cleanup completed: ${totalCleaned} tokens cleaned up`);
        console.log(`   - Expired: ${expiredCount}`);
        console.log(`   - Old revoked: ${oldRevokedCount}`);
        console.log(`   - Orphaned: ${orphanedCount}`);
      } else {
        console.log('✅ Token cleanup completed: No tokens to clean up');
      }
      
      // Log statistics periodically
      if (this.stats.totalRuns % 24 === 0) { // Every 24 hours
        this.logStatistics();
      }
      
    } catch (error) {
      this.stats.errors++;
      console.error('❌ Error during token cleanup:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Clean up old revoked tokens
   */
  async cleanupOldRevokedTokens() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const oldRevokedTokens = await RefreshToken.find({
      isRevoked: true,
      revokedAt: { $lt: thirtyDaysAgo }
    });
    
    if (oldRevokedTokens.length > 0) {
      await RefreshToken.deleteMany({
        _id: { $in: oldRevokedTokens.map(t => t._id) }
      });
    }
    
    return oldRevokedTokens.length;
  }

  /**
   * Clean up orphaned tokens (tokens for users that no longer exist)
   */
  async cleanupOrphanedTokens() {
    // This requires a more complex aggregation to find tokens without valid users
    const orphanedTokens = await RefreshToken.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDoc'
        }
      },
      {
        $match: {
          userDoc: { $size: 0 } // No matching user found
        }
      },
      {
        $project: { _id: 1 }
      }
    ]);
    
    if (orphanedTokens.length > 0) {
      await RefreshToken.deleteMany({
        _id: { $in: orphanedTokens.map(t => t._id) }
      });
    }
    
    return orphanedTokens.length;
  }

  /**
   * Get cleanup statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      uptime: this.lastRun ? Date.now() - this.lastRun.getTime() : 0
    };
  }

  /**
   * Log cleanup statistics
   */
  logStatistics() {
    console.log('\n📊 Token Cleanup Statistics:');
    console.log(`   Total runs: ${this.stats.totalRuns}`);
    console.log(`   Total tokens cleaned: ${this.stats.tokensCleanedUp}`);
    console.log(`   Last cleanup count: ${this.stats.lastCleanupCount}`);
    console.log(`   Errors: ${this.stats.errors}`);
    console.log(`   Last run: ${this.lastRun?.toISOString() || 'Never'}`);
    console.log(`   Currently running: ${this.isRunning ? 'Yes' : 'No'}\n`);
  }

  /**
   * Force run cleanup (for manual triggers)
   */
  async forceCleanup() {
    console.log('🔧 Force running token cleanup...');
    await this.runCleanup();
  }

  /**
   * Stop the cleanup job
   */
  stop() {
    console.log('🛑 Stopping token cleanup job...');
    // Note: node-cron doesn't provide a direct way to stop specific jobs
    // In a production environment, you might want to track the job reference
  }
}

// Create and export singleton instance
const tokenCleanupJob = new TokenCleanupJob();

export default tokenCleanupJob;
