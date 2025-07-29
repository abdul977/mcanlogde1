import CommunityMessage from "../models/CommunityMessage.js";
import CommunityMember from "../models/CommunityMember.js";
import ModerationLog from "../models/ModerationLog.js";

class AntiSpamService {
  constructor() {
    // Spam detection thresholds
    this.SPAM_THRESHOLDS = {
      DUPLICATE_MESSAGE_COUNT: 3, // Same message repeated 3+ times
      RAPID_MESSAGE_COUNT: 10, // 10+ messages in rapid succession
      RAPID_MESSAGE_WINDOW: 60, // Within 60 seconds
      CAPS_PERCENTAGE: 70, // 70%+ uppercase characters
      LINK_COUNT: 5, // 5+ links in a single message
      MENTION_COUNT: 10, // 10+ mentions in a single message
      EMOJI_PERCENTAGE: 50, // 50%+ emoji characters
      REPEATED_CHAR_COUNT: 10 // 10+ repeated characters in sequence
    };

    // Spam score weights
    this.SPAM_WEIGHTS = {
      DUPLICATE_MESSAGE: 30,
      RAPID_MESSAGING: 25,
      EXCESSIVE_CAPS: 15,
      EXCESSIVE_LINKS: 20,
      EXCESSIVE_MENTIONS: 15,
      EXCESSIVE_EMOJIS: 10,
      REPEATED_CHARACTERS: 10,
      SUSPICIOUS_PATTERNS: 20
    };
  }

  // Main spam detection function
  async detectSpam(message, userId, communityId) {
    let spamScore = 0;
    const reasons = [];

    try {
      // Check for duplicate messages
      const duplicateScore = await this.checkDuplicateMessages(message.content, userId, communityId);
      if (duplicateScore > 0) {
        spamScore += duplicateScore;
        reasons.push('Duplicate message detected');
      }

      // Check for rapid messaging
      const rapidScore = await this.checkRapidMessaging(userId, communityId);
      if (rapidScore > 0) {
        spamScore += rapidScore;
        reasons.push('Rapid messaging detected');
      }

      // Check message content patterns
      const contentScore = this.analyzeMessageContent(message.content);
      spamScore += contentScore.score;
      reasons.push(...contentScore.reasons);

      // Check for suspicious patterns
      const patternScore = this.checkSuspiciousPatterns(message.content);
      if (patternScore > 0) {
        spamScore += patternScore;
        reasons.push('Suspicious patterns detected');
      }

      return {
        spamScore: Math.min(spamScore, 100), // Cap at 100
        isSpam: spamScore >= 70, // Threshold for automatic action
        reasons,
        severity: this.getSpamSeverity(spamScore)
      };
    } catch (error) {
      console.error('Error in spam detection:', error);
      return {
        spamScore: 0,
        isSpam: false,
        reasons: [],
        severity: 'low'
      };
    }
  }

  // Check for duplicate messages
  async checkDuplicateMessages(content, userId, communityId) {
    const recentMessages = await CommunityMessage.find({
      community: communityId,
      sender: userId,
      content: content.trim(),
      isDeleted: false,
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // Last 10 minutes
    }).limit(5);

    if (recentMessages.length >= this.SPAM_THRESHOLDS.DUPLICATE_MESSAGE_COUNT) {
      return this.SPAM_WEIGHTS.DUPLICATE_MESSAGE;
    }

    return 0;
  }

  // Check for rapid messaging
  async checkRapidMessaging(userId, communityId) {
    const recentMessages = await CommunityMessage.find({
      community: communityId,
      sender: userId,
      isDeleted: false,
      createdAt: { $gte: new Date(Date.now() - this.SPAM_THRESHOLDS.RAPID_MESSAGE_WINDOW * 1000) }
    }).countDocuments();

    if (recentMessages >= this.SPAM_THRESHOLDS.RAPID_MESSAGE_COUNT) {
      return this.SPAM_WEIGHTS.RAPID_MESSAGING;
    }

    return 0;
  }

  // Analyze message content for spam patterns
  analyzeMessageContent(content) {
    let score = 0;
    const reasons = [];

    // Check for excessive caps
    const capsPercentage = this.calculateCapsPercentage(content);
    if (capsPercentage >= this.SPAM_THRESHOLDS.CAPS_PERCENTAGE) {
      score += this.SPAM_WEIGHTS.EXCESSIVE_CAPS;
      reasons.push('Excessive capital letters');
    }

    // Check for excessive links
    const linkCount = this.countLinks(content);
    if (linkCount >= this.SPAM_THRESHOLDS.LINK_COUNT) {
      score += this.SPAM_WEIGHTS.EXCESSIVE_LINKS;
      reasons.push('Excessive links');
    }

    // Check for excessive mentions
    const mentionCount = this.countMentions(content);
    if (mentionCount >= this.SPAM_THRESHOLDS.MENTION_COUNT) {
      score += this.SPAM_WEIGHTS.EXCESSIVE_MENTIONS;
      reasons.push('Excessive mentions');
    }

    // Check for excessive emojis
    const emojiPercentage = this.calculateEmojiPercentage(content);
    if (emojiPercentage >= this.SPAM_THRESHOLDS.EMOJI_PERCENTAGE) {
      score += this.SPAM_WEIGHTS.EXCESSIVE_EMOJIS;
      reasons.push('Excessive emojis');
    }

    // Check for repeated characters
    if (this.hasRepeatedCharacters(content)) {
      score += this.SPAM_WEIGHTS.REPEATED_CHARACTERS;
      reasons.push('Repeated characters');
    }

    return { score, reasons };
  }

  // Check for suspicious patterns
  checkSuspiciousPatterns(content) {
    const suspiciousPatterns = [
      /(?:click|visit|check)\s+(?:here|this|link)/gi,
      /(?:free|win|prize|money|cash|earn)/gi,
      /(?:urgent|limited|offer|deal|discount)/gi,
      /(?:bitcoin|crypto|investment|trading)/gi,
      /(?:viagra|casino|gambling|lottery)/gi
    ];

    let matchCount = 0;
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        matchCount++;
      }
    }

    return matchCount >= 2 ? this.SPAM_WEIGHTS.SUSPICIOUS_PATTERNS : 0;
  }

  // Helper functions
  calculateCapsPercentage(text) {
    const letters = text.replace(/[^a-zA-Z]/g, '');
    if (letters.length === 0) return 0;
    const caps = text.replace(/[^A-Z]/g, '');
    return (caps.length / letters.length) * 100;
  }

  countLinks(text) {
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b)/gi;
    const matches = text.match(linkRegex);
    return matches ? matches.length : 0;
  }

  countMentions(text) {
    const mentionRegex = /@\w+/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.length : 0;
  }

  calculateEmojiPercentage(text) {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = text.match(emojiRegex);
    const emojiCount = emojis ? emojis.length : 0;
    const totalChars = text.length;
    return totalChars > 0 ? (emojiCount / totalChars) * 100 : 0;
  }

  hasRepeatedCharacters(text) {
    const repeatedRegex = /(.)\1{9,}/; // 10 or more repeated characters
    return repeatedRegex.test(text);
  }

  getSpamSeverity(score) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  // Auto-moderation actions based on spam score
  async handleSpamDetection(message, spamResult, userId, communityId) {
    if (!spamResult.isSpam) return;

    try {
      // Update message spam score
      await CommunityMessage.findByIdAndUpdate(message._id, {
        spamScore: spamResult.spamScore,
        flaggedAsSpam: true
      });

      // Log the spam detection
      await ModerationLog.logAction({
        community: communityId,
        moderator: null, // System action
        target: { 
          user: userId,
          message: message._id 
        },
        action: "warn_member",
        reason: `Spam detected: ${spamResult.reasons.join(', ')}`,
        details: {
          spamScore: spamResult.spamScore,
          reasons: spamResult.reasons,
          severity: spamResult.severity
        },
        metadata: {
          severity: spamResult.severity,
          platform: 'system'
        }
      });

      // Take action based on severity
      if (spamResult.severity === 'critical') {
        await this.muteUser(userId, communityId, 60); // 1 hour mute
      } else if (spamResult.severity === 'high') {
        await this.muteUser(userId, communityId, 30); // 30 minutes mute
      }

      // TODO: Send notification to moderators
      // This will be implemented in the notification system task

    } catch (error) {
      console.error('Error handling spam detection:', error);
    }
  }

  // Mute user for specified duration
  async muteUser(userId, communityId, durationMinutes) {
    try {
      const member = await CommunityMember.findOne({
        community: communityId,
        user: userId,
        status: 'active'
      });

      if (member) {
        member.settings.muteUntil = new Date(Date.now() + (durationMinutes * 60 * 1000));
        await member.save();

        // Log the mute action
        await ModerationLog.logAction({
          community: communityId,
          moderator: null, // System action
          target: { user: userId },
          action: "mute_member",
          reason: "Automatic mute due to spam detection",
          details: {
            duration: durationMinutes,
            expiresAt: member.settings.muteUntil
          },
          metadata: {
            severity: 'medium',
            platform: 'system'
          }
        });
      }
    } catch (error) {
      console.error('Error muting user:', error);
    }
  }

  // Rate limiting check
  async checkRateLimit(userId, communityId, rateLimitSeconds) {
    const lastMessage = await CommunityMessage.findOne({
      community: communityId,
      sender: userId,
      isDeleted: false
    }).sort({ createdAt: -1 });

    if (!lastMessage) return { allowed: true };

    const timeDiff = (Date.now() - lastMessage.createdAt.getTime()) / 1000;
    
    if (timeDiff < rateLimitSeconds) {
      return {
        allowed: false,
        retryAfter: Math.ceil(rateLimitSeconds - timeDiff),
        message: `Please wait ${Math.ceil(rateLimitSeconds - timeDiff)} seconds before sending another message`
      };
    }

    return { allowed: true };
  }
}

export default new AntiSpamService();
