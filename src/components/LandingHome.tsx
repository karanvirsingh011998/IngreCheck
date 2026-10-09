import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { OPEN_FOOD_FACTS_TERMS } from '../config/openFoodFacts';
import { colors, radius, spacing, type } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { BrandMark } from './BrandMark';
import { Button } from './Button';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const FEATURES: { title: string; body: string }[] = [
  {
    title: 'Barcode scanning',
    body: 'Scan a packaged food barcode to find available product information.',
  },
  {
    title: 'Ingredient exploration',
    body: 'Review the ingredient list provided for the product.',
  },
  {
    title: 'Nutrition information',
    body: 'Explore available nutrition values, including relevant per-100 g or per-100 ml information.',
  },
  {
    title: 'Allergen and trace information',
    body: 'Review declared allergens and trace information when provided by the data source.',
  },
  {
    title: 'Product comparison',
    body: 'Compare available ingredient and nutrition information side by side.',
  },
  {
    title: 'Favorites and history',
    body: 'Revisit products you have saved or scanned, when those features are available.',
  },
  {
    title: 'Ingredient preferences',
    body: 'Keep track of ingredients you want to pay attention to, subject to the information available for each product.',
  },
  {
    title: 'Processing information',
    body: 'Explore processing classifications, such as NOVA, when the product data includes them.',
  },
];

const STEPS = [
  {
    title: 'Scan or search',
    body: 'Scan a barcode or search for a product by name or brand.',
  },
  {
    title: 'Explore product details',
    body: 'Review the available ingredients, nutrition, allergens, and other product information.',
  },
  {
    title: 'Compare or save',
    body: 'Compare products or save items for later if you want to revisit them.',
  },
];

const BENEFITS = [
  'See available food-label information in one place.',
  'Understand ingredient lists more easily.',
  'Review nutrition information without manually comparing multiple labels.',
  'Identify differences between products.',
  'Keep track of products that matter to you.',
];

export function LandingHome({ navigation }: { navigation: Navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.brandRow}>
          <BrandMark size={56} />
          <View style={styles.brandText}>
            <Text style={styles.wordmark}>IngreCheck</Text>
            <Text style={styles.tagline}>Scan ingredients. Know instantly.</Text>
          </View>
        </View>
        <Text style={styles.headline}>Know What's in Your Food.</Text>
        <Text style={styles.body}>
          Scan packaged food barcodes to explore ingredients, nutrition facts, declared allergens, and other available
          product information. Compare products and make more informed choices about what you buy.
        </Text>
        <Button label="Start Scanning" onPress={() => navigation.navigate('Scanner')} />
        <Button label="Search Products" onPress={() => navigation.navigate('Search')} variant="secondary" />
        <View style={styles.authRow}>
          <View style={styles.authSlot}>
            <Button label="Log In" onPress={() => navigation.navigate('SignIn')} variant="secondary" />
          </View>
          <View style={styles.authSlot}>
            <Button label="Sign Up" onPress={() => navigation.navigate('SignUp')} variant="secondary" />
          </View>
        </View>
        <Text style={styles.note}>No account needed to start scanning.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What you can explore</Text>
        <Text style={styles.body}>
          A product page shows only the fields that record includes. One food may have ingredients and nutrition, while
          another is missing allergens or a NOVA group.
        </Text>
        {FEATURES.map((feature, index) => (
          <View key={feature.title} style={styles.card}>
            <View style={styles.icon}>
              <Text style={styles.iconText}>{index + 1}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{feature.title}</Text>
              <Text style={styles.cardBody}>{feature.body}</Text>
            </View>
          </View>
        ))}
        <Text style={styles.note}>
          Saving favorites, scan history, and ingredient preferences uses an optional account. Scanning, search, and
          comparison work without one.
        </Text>
        <Button label="Compare products" onPress={() => navigation.navigate('Compare')} variant="secondary" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How it works</Text>
        {STEPS.map((step, index) => (
          <View key={step.title} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{step.title}</Text>
              <Text style={styles.cardBody}>{step.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why use IngreCheck?</Text>
        <Text style={styles.body}>
          IngreCheck gathers the product record in one place. It does not medically evaluate food, and it does not
          check every record against the package.
        </Text>
        {BENEFITS.map((benefit) => (
          <View key={benefit} style={styles.benefit}>
            <View style={styles.dot} />
            <Text style={styles.cardBody}>{benefit}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reading ingredients and allergens</Text>
        <Text style={styles.body}>
          Ingredients, allergens, and traces appear only when the data source includes them. A missing field is not
          proof that an ingredient or allergen is absent.
        </Text>
        <Text style={styles.body}>
          If you have an allergy, check the package you are holding. Formulas and labels can change. IngreCheck is an
          information tool and does not replace medical advice.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Where the information comes from</Text>
        <Text style={styles.body}>
          Product details come from Open Food Facts. Contributors add that data. The database can be incomplete,
          inaccurate, or out of date. IngreCheck does not verify each product itself.
        </Text>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL('https://world.openfoodfacts.org')} style={styles.linkHit}>
          <Text style={styles.link}>Open Food Facts</Text>
        </Pressable>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(OPEN_FOOD_FACTS_TERMS)} style={styles.linkHit}>
          <Text style={styles.link}>Open Food Facts terms and Open Database License</Text>
        </Pressable>
      </View>

      <View style={styles.closing}>
        <Text style={styles.sectionTitle}>Ready to explore what's in your food?</Text>
        <Button label="Start Scanning" onPress={() => navigation.navigate('Scanner')} />
        <Button label="Search Products" onPress={() => navigation.navigate('Search')} variant="secondary" />
        <View style={styles.authRow}>
          <View style={styles.authSlot}>
            <Button label="Log In" onPress={() => navigation.navigate('SignIn')} variant="ghost" />
          </View>
          <View style={styles.authSlot}>
            <Button label="Sign Up" onPress={() => navigation.navigate('SignUp')} variant="ghost" />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Privacy')} style={styles.linkHit}>
          <Text style={styles.link}>Privacy draft</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Terms')} style={styles.linkHit}>
          <Text style={styles.link}>Terms draft</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Help')} style={styles.linkHit}>
          <Text style={styles.link}>Help</Text>
        </Pressable>
        <Text style={styles.disclaimer}>
          Product information may be incomplete or outdated. Always check the product packaging, especially if you have
          a food allergy.
        </Text>
        <Text style={styles.note}>Privacy and terms are drafts and have not been approved for publication.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  hero: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  brandText: {
    flex: 1,
    gap: spacing.xs,
  },
  wordmark: {
    ...type.heading,
    color: colors.primary,
  },
  tagline: {
    ...type.caption,
    color: colors.fresh,
    fontWeight: '600',
  },
  headline: {
    ...type.title,
    color: colors.text,
  },
  body: {
    ...type.body,
    color: colors.secondary,
  },
  authRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  authSlot: {
    flex: 1,
  },
  note: {
    ...type.caption,
    color: colors.secondary,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...type.heading,
    color: colors.primary,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    ...type.label,
    color: colors.primary,
  },
  cardText: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    ...type.label,
    color: colors.text,
  },
  cardBody: {
    ...type.body,
    color: colors.secondary,
    flexShrink: 1,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...type.label,
    color: colors.white,
  },
  benefit: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.fresh,
    marginTop: 8,
  },
  linkHit: {
    minHeight: 44,
    justifyContent: 'center',
  },
  link: {
    ...type.label,
    color: colors.fresh,
    textDecorationLine: 'underline',
  },
  closing: {
    backgroundColor: colors.mint,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  footer: {
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  disclaimer: {
    ...type.caption,
    color: colors.secondary,
    marginTop: spacing.sm,
  },
});
